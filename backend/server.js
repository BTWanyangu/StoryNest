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

const PLAN_LIMITS = {
  free: { stories: 3, children: 1 },
  pro: { stories: 50, children: 3 },
  pro_unlimited: { stories: Infinity, children: 6 },
};

const PLAN_PRICE_MAP = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  pro_unlimited: process.env.STRIPE_PRO_UNLIMITED_PRICE_ID || '',
};

const PRICE_PLAN_MAP = Object.fromEntries(
  Object.entries(PLAN_PRICE_MAP)
    .filter(([, value]) => Boolean(value))
    .map(([plan, priceId]) => [priceId, plan])
);

app.use(cors({ origin: process.env.FRONTEND_URL || true }));

app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

function resolvePlanFromPriceId(priceId) {
  return PRICE_PLAN_MAP[priceId] || 'free';
}

function resolvePriceIdFromPlan(plan) {
  return PLAN_PRICE_MAP[plan] || null;
}

function toIsoOrNull(unixSeconds) {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

function isStripeMissingResourceError(error, resourceType) {
  const message = error?.message || '';
  return (
    error?.type === 'StripeInvalidRequestError' &&
    message.toLowerCase().includes(`no such ${resourceType}`)
  );
}

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
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
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

  async updateUserById(userId, fields) {
    const { error } = await supabaseAdmin
      .from('users')
      .update(fields)
      .eq('id', userId);

    if (error) throw error;
  },

  async updateUserByStripeCustomerId(stripeCustomerId, fields) {
    const { error } = await supabaseAdmin
      .from('users')
      .update(fields)
      .eq('stripe_customer_id', stripeCustomerId);

    if (error) throw error;
  },

  async logRenewal(stripeCustomerId, invoiceId, amount, plan = null) {
    const { error } = await supabaseAdmin
      .from('renewals')
      .upsert(
        {
          stripe_customer_id: stripeCustomerId,
          stripe_invoice_id: invoiceId,
          amount_pence: amount,
          plan,
        },
        { onConflict: 'stripe_invoice_id' }
      );

    if (error) throw error;
  },
};

async function createFreshStripeCustomer(authUser) {
  const customer = await stripe.customers.create({
    email: authUser.email,
    metadata: { storynest_user_id: authUser.id },
  });

  await db.updateUserById(authUser.id, {
    stripe_customer_id: customer.id,
    stripe_subscription_id: null,
    stripe_price_id: null,
    subscription_period_start: null,
    subscription_period_end: null,
    trial_ends_at: null,
    plan: 'free',
  });

  return customer.id;
}

async function ensureValidStripeCustomer(authUser, userRecord) {
  const existingCustomerId = userRecord.stripe_customer_id;

  if (!existingCustomerId) {
    return createFreshStripeCustomer(authUser);
  }

  try {
    await stripe.customers.retrieve(existingCustomerId);
    return existingCustomerId;
  } catch (error) {
    if (!isStripeMissingResourceError(error, 'customer')) {
      throw error;
    }

    console.warn('[stripe] Stored customer missing, recreating:', existingCustomerId);
    return createFreshStripeCustomer(authUser);
  }
}

async function applySubscriptionToUser(userId, stripeCustomerId, subscription) {
  const firstItem = subscription?.items?.data?.[0];
  const priceId = firstItem?.price?.id || null;
  const plan = resolvePlanFromPriceId(priceId);
  const currentPeriodStart = toIsoOrNull(subscription?.current_period_start);
  const currentPeriodEnd = toIsoOrNull(subscription?.current_period_end);
  const trialEndsAt = toIsoOrNull(subscription?.trial_end);

  const existingUser = await db.getUserById(userId);

  const shouldResetStories =
    existingUser.subscription_period_start !== currentPeriodStart &&
    ['pro', 'pro_unlimited'].includes(plan);

  await db.updateUserById(userId, {
    plan,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    subscription_period_start: currentPeriodStart,
    subscription_period_end: currentPeriodEnd,
    trial_ends_at: trialEndsAt,
    ...(shouldResetStories
      ? {
          stories_generated: 0,
          stories_period_started_at: currentPeriodStart || new Date().toISOString(),
        }
      : {}),
  });
}

async function downgradeUserToFreeByCustomerId(stripeCustomerId) {
  const existingUser = await db.getUserByStripeCustomerId(stripeCustomerId);
  if (!existingUser) return;

  await db.updateUserByStripeCustomerId(stripeCustomerId, {
    plan: 'free',
    stripe_subscription_id: null,
    stripe_price_id: null,
    subscription_period_start: null,
    subscription_period_end: null,
    trial_ends_at: null,
  });
}

async function maybeResetUsageWindow(userRecord) {
  if (!['pro', 'pro_unlimited'].includes(userRecord.plan)) {
    return userRecord;
  }

  if (!userRecord.subscription_period_start) {
    return userRecord;
  }

  const currentWindowStart = userRecord.subscription_period_start;
  const storedWindowStart = userRecord.stories_period_started_at;

  if (storedWindowStart === currentWindowStart) {
    return userRecord;
  }

  const updatedFields = {
    stories_generated: 0,
    stories_period_started_at: currentWindowStart,
  };

  await db.updateUserById(userRecord.id, updatedFields);

  return {
    ...userRecord,
    ...updatedFields,
  };
}

app.post('/generate-story', async (req, res) => {
  try {
    let { userRecord } = await getAuthContext(req);
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    userRecord = await maybeResetUsageWindow(userRecord);

    const planLimits = getPlanLimits(userRecord.plan);
    const storyAllowance = planLimits.stories;

    if (Number.isFinite(storyAllowance) && userRecord.stories_generated >= storyAllowance) {
      return res.status(403).json({
        error:
          userRecord.plan === 'free'
            ? 'Free story limit reached. Upgrade to continue.'
            : userRecord.plan === 'pro'
            ? 'Pro story limit reached for this billing cycle. Upgrade to Pro Unlimited or wait for renewal.'
            : 'Story limit reached.',
      });
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
        max_tokens: 1800,
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
    return res.status(error.status || 500).json({
      error: error.message || 'Could not generate story',
    });
  }
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { authUser, userRecord } = await getAuthContext(req);
    const requestedPlan = req.body?.plan;

    if (!requestedPlan || !['pro', 'pro_unlimited'].includes(requestedPlan)) {
      return res.status(400).json({ error: 'A valid plan is required: pro or pro_unlimited.' });
    }

    const selectedPriceId = resolvePriceIdFromPlan(requestedPlan);

    if (!selectedPriceId) {
      return res.status(500).json({ error: `Price ID is not configured for plan ${requestedPlan}.` });
    }

    const stripeCustomerId = await ensureValidStripeCustomer(authUser, userRecord);

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : authUser.email,
      payment_method_types: ['card'],
      line_items: [{ price: selectedPriceId, quantity: 1 }],
      mode: 'subscription',
      automatic_tax: { enabled: true },
      customer_update: { address: 'auto' },
      success_url: `${process.env.FRONTEND_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}?cancelled=true`,
      metadata: {
        storynest_user_id: authUser.id,
        selected_plan: requestedPlan,
      },
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          storynest_user_id: authUser.id,
          selected_plan: requestedPlan,
        },
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('[create-checkout-session]', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Could not create checkout session',
    });
  }
});

app.post('/create-portal-session', async (req, res) => {
  try {
    const { authUser, userRecord } = await getAuthContext(req);

    const stripeCustomerId = await ensureValidStripeCustomer(authUser, userRecord);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: process.env.FRONTEND_URL,
    });

    return res.json({ url: portalSession.url });
  } catch (error) {
    console.error('[create-portal-session]', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Could not create portal session',
    });
  }
});

app.get('/subscription-status', async (req, res) => {
  try {
    const { authUser, userRecord } = await getAuthContext(req);

    if (!userRecord.stripe_customer_id) {
      return res.json({
        plan: userRecord.plan || 'free',
        status: 'none',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
      });
    }

    const customerId = userRecord.stripe_customer_id;

    try {
      await stripe.customers.retrieve(customerId);
    } catch (error) {
      if (!isStripeMissingResourceError(error, 'customer')) {
        throw error;
      }

      console.warn('[subscription-status] Stored customer missing, resetting:', customerId);

      await db.updateUserById(authUser.id, {
        stripe_customer_id: null,
        stripe_subscription_id: null,
        stripe_price_id: null,
        subscription_period_start: null,
        subscription_period_end: null,
        trial_ends_at: null,
        plan: 'free',
      });

      return res.json({
        plan: 'free',
        status: 'none',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEndsAt: null,
      });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 5,
      expand: ['data.items.data.price'],
    });

    const activeSub = subscriptions.data.find((sub) =>
      ['active', 'trialing', 'past_due'].includes(sub.status)
    );

    if (activeSub) {
      const firstItem = activeSub.items?.data?.[0];
      const priceId = firstItem?.price?.id || null;
      const plan = resolvePlanFromPriceId(priceId);

      return res.json({
        plan,
        status: activeSub.status,
        currentPeriodEnd: activeSub.current_period_end,
        cancelAtPeriodEnd: activeSub.cancel_at_period_end,
        trialEndsAt: activeSub.trial_end,
      });
    }

    return res.json({
      plan: 'free',
      status: 'cancelled',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      trialEndsAt: null,
    });
  } catch (error) {
    console.error('[subscription-status]', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Could not get subscription status',
    });
  }
});

app.post('/sync-checkout-session', async (req, res) => {
  try {
    const { authUser } = await getAuthContext(req);
    const sessionId = req.query.session_id;

    if (!sessionId) {
      return res.status(400).json({ error: 'session_id query parameter is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.storynest_user_id !== authUser.id) {
      return res.status(403).json({ error: 'Checkout session does not belong to this user' });
    }

    if (session.customer && session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription, {
        expand: ['items.data.price'],
      });

      await applySubscriptionToUser(authUser.id, session.customer, subscription);
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('[sync-checkout-session]', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Could not sync checkout session',
    });
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
        if (isStripeMissingResourceError(stripeError, 'customer')) {
          console.warn('[delete-account] Stripe customer already missing:', userRecord.stripe_customer_id);
        } else {
          console.warn('Stripe cancellation warning:', stripeError.message);
        }
      }
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
    if (error) throw error;

    return res.json({ ok: true });
  } catch (error) {
    console.error('[delete-account]', error);
    return res.status(error.status || 500).json({
      error: error.message || 'Could not delete account',
    });
  }
});

app.post('/webhook', async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('[webhook] Signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.metadata?.storynest_user_id && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription, {
            expand: ['items.data.price'],
          });

          await applySubscriptionToUser(
            session.metadata.storynest_user_id,
            session.customer,
            subscription
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await downgradeUserToFreeByCustomerId(subscription.customer);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userRecord = await db.getUserByStripeCustomerId(subscription.customer);

        if (!userRecord) break;

        if (['active', 'trialing', 'past_due'].includes(subscription.status)) {
          await applySubscriptionToUser(userRecord.id, subscription.customer, subscription);
        } else if (
          ['canceled', 'unpaid', 'incomplete_expired', 'paused'].includes(subscription.status)
        ) {
          await downgradeUserToFreeByCustomerId(subscription.customer);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        let plan = null;

        if (subscriptionId && invoice.customer) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
              expand: ['items.data.price'],
            });

            const priceId = subscription?.items?.data?.[0]?.price?.id || null;
            plan = resolvePlanFromPriceId(priceId);

            const userRecord = await db.getUserByStripeCustomerId(invoice.customer);
            if (userRecord && ['pro', 'pro_unlimited'].includes(plan)) {
              await applySubscriptionToUser(userRecord.id, invoice.customer, subscription);
            }
          } catch (subError) {
            console.warn('[invoice.paid] Could not refresh subscription state:', subError.message);
          }
        }

        await db.logRenewal(invoice.customer, invoice.id, invoice.amount_paid, plan);
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
  console.log(`Moonspun backend running on port ${PORT}`);
});