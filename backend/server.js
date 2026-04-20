require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-role'
);

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

async function getAuthContext(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    const error = new Error('Missing authorization token');
    error.status = 401;
    throw error;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    const authError = new Error('Unauthorized');
    authError.status = 401;
    throw authError;
  }

  const userId = data.user.id;
  const { data: userRecord, error: userRecordError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userRecordError || !userRecord) {
    const dbError = new Error('User profile not found. Make sure the signup trigger created public.users row.');
    dbError.status = 404;
    throw dbError;
  }

  return { authUser: data.user, userRecord, token };
}

const db = {
  async getUserById(userId) {
    const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },

  async upgradeToPremium(userId, stripeCustomerId, subscriptionId) {
    const { error } = await supabaseAdmin.from('users').update({
      plan: 'premium',
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscriptionId,
    }).eq('id', userId);
    if (error) throw error;
  },

  async downgradeToFree(stripeCustomerId) {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ plan: 'free' })
      .eq('stripe_customer_id', stripeCustomerId);
    if (error) throw error;
  },

  async getUserByStripeCustomerId(stripeCustomerId) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async logRenewal(stripeCustomerId, invoiceId, amount) {
    const { error } = await supabaseAdmin.from('renewals').upsert({
      stripe_customer_id: stripeCustomerId,
      stripe_invoice_id: invoiceId,
      amount_pence: amount,
    }, { onConflict: 'stripe_invoice_id' });
    if (error) throw error;
  },
};

app.post('/generate-story', async (req, res) => {
  try {
    const { userRecord } = await getAuthContext(req);
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (userRecord.plan !== 'premium' && userRecord.stories_generated >= 3) {
      return res.status(403).json({ error: 'Free story limit reached. Upgrade to premium.' });
    }

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const anthropicData = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      console.error('[generate-story][anthropic]', anthropicData);

      const error = new Error(
        anthropicData?.error?.message ||
        anthropicData?.message ||
        'Anthropic request failed'
      );
      error.status = anthropicResponse.status;
      throw error;
    }

    const text = anthropicData?.content?.[0]?.text || '';
    return res.json({ text });
  } catch (error) {
    console.error('[generate-story]', error);
    return res.status(error.status || 500).json({ error: error.message || 'Could not generate story' });
  }
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { authUser, userRecord } = await getAuthContext(req);
    let stripeCustomerId = userRecord.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: authUser.email,
        metadata: { storynest_user_id: authUser.id },
      });
      stripeCustomerId = customer.id;
      await supabaseAdmin.from('users').update({ stripe_customer_id: stripeCustomerId }).eq('id', authUser.id);
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : authUser.email,
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      mode: 'subscription',
      automatic_tax: { enabled: true },
      customer_update: { address: 'auto' },
      success_url: `${process.env.FRONTEND_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}?cancelled=true`,
      metadata: { storynest_user_id: authUser.id },
      subscription_data: { metadata: { storynest_user_id: authUser.id } },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('[create-checkout-session]', error);
    return res.status(error.status || 500).json({ error: error.message || 'Could not create checkout session' });
  }
});

app.post('/create-portal-session', async (req, res) => {
  try {
    const { userRecord } = await getAuthContext(req);
    if (!userRecord.stripe_customer_id) {
      return res.status(404).json({ error: 'No Stripe customer found for this user' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userRecord.stripe_customer_id,
      return_url: process.env.FRONTEND_URL,
    });

    return res.json({ url: portalSession.url });
  } catch (error) {
    console.error('[create-portal-session]', error);
    return res.status(error.status || 500).json({ error: error.message || 'Could not create portal session' });
  }
});

app.get('/subscription-status', async (req, res) => {
  try {
    const { userRecord } = await getAuthContext(req);
    if (!userRecord.stripe_customer_id) {
      return res.json({ plan: userRecord.plan || 'free', status: 'none' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: userRecord.stripe_customer_id,
      status: 'all',
      limit: 5,
    });

    const activeSub = subscriptions.data.find((sub) => ['active', 'trialing', 'past_due'].includes(sub.status));

    if (activeSub) {
      return res.json({
        plan: 'premium',
        status: activeSub.status,
        currentPeriodEnd: activeSub.current_period_end,
        cancelAtPeriodEnd: activeSub.cancel_at_period_end,
      });
    }

    return res.json({ plan: 'free', status: 'cancelled' });
  } catch (error) {
    console.error('[subscription-status]', error);
    return res.status(error.status || 500).json({ error: error.message || 'Could not get subscription status' });
  }
});

app.post('/sync-checkout-session', async (req, res) => {
  try {
    const { authUser } = await getAuthContext(req);
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).json({ error: 'session_id query parameter is required' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.storynest_user_id !== authUser.id) {
      return res.status(403).json({ error: 'Checkout session does not belong to this user' });
    }

    if (session.customer && session.subscription) {
      await db.upgradeToPremium(authUser.id, session.customer, session.subscription);
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('[sync-checkout-session]', error);
    return res.status(error.status || 500).json({ error: error.message || 'Could not sync checkout session' });
  }
});

app.delete('/delete-account', async (req, res) => {
  try {
    const { authUser, userRecord } = await getAuthContext(req);

    if (userRecord.stripe_customer_id) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: userRecord.stripe_customer_id,
          status: 'all',
          limit: 10,
        });

        for (const sub of subscriptions.data) {
          if (!['canceled', 'incomplete_expired'].includes(sub.status)) {
            await stripe.subscriptions.cancel(sub.id);
          }
        }
      } catch (stripeError) {
        console.warn('Stripe cancellation warning:', stripeError.message);
      }
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
    if (error) throw error;

    return res.json({ ok: true });
  } catch (error) {
    console.error('[delete-account]', error);
    return res.status(error.status || 500).json({ error: error.message || 'Could not delete account' });
  }
});

app.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('[webhook] Signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.metadata?.storynest_user_id) {
          await db.upgradeToPremium(session.metadata.storynest_user_id, session.customer, session.subscription);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await db.downgradeToFree(subscription.customer);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        if (['active', 'trialing', 'past_due'].includes(subscription.status)) {
          const userRecord = await db.getUserByStripeCustomerId(subscription.customer);
          if (userRecord) {
            await db.upgradeToPremium(userRecord.id, subscription.customer, subscription.id);
          }
        } else if (['canceled', 'unpaid', 'incomplete_expired', 'paused'].includes(subscription.status)) {
          await db.downgradeToFree(subscription.customer);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        await db.logRenewal(invoice.customer, invoice.id, invoice.amount_paid);
        break;
      }

      case 'invoice.payment_failed': {
        console.warn('[webhook] Payment failed for customer:', event.data.object.customer);
        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('[webhook] Handler failed:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`StoryNest backend running on port ${PORT}`);
});