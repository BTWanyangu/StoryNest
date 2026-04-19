# StoryNest setup guide

## 1. Supabase

1. Create a new Supabase project.
2. Enable Email auth.
3. Open SQL Editor.
4. Run `../sql/schema.sql`.
5. Copy these values:
   - Project URL
   - anon key
   - service role key

## 2. Stripe

1. Create product: `StoryNest Premium`
2. Set recurring price: `£5/month`
3. Copy the `price_id`
4. Create webhook endpoint:
   - `https://YOUR_BACKEND_DOMAIN/webhook`
5. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.paid`
   - `invoice.payment_failed`
6. Copy the webhook signing secret
7. Enable billing portal and automatic tax

## 3. Anthropic

1. Create an API key
2. Put it into backend `.env`

## 4. Frontend env

Create `frontend/.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_BACKEND_URL=https://YOUR_BACKEND_DOMAIN
```

## 5. Backend env

Create `backend/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID=price_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
```

## 6. Run locally

### Backend
```bash
cd backend
npm install
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 7. Deploy

### Frontend
- Vercel, Netlify, or Cloudflare Pages

### Backend
- Railway, Render, or Fly.io

## 8. Android readiness

This frontend is now React-based and can be wrapped with:
- Capacitor
- Cordova
- Android WebView shell

That was not practical with the original one-file mock setup.
