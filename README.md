# StoryNest React Production Build

This package migrates the provided single-file StoryNest HTML app into a production-ready React + Tailwind frontend with an Express backend.

## What's included

- `frontend/` — React + Vite + Tailwind app
- `backend/` — Express API for Stripe, Anthropic, and secure account actions
- `sql/schema.sql` — Supabase schema, RLS policies, and signup trigger
- `docs/SETUP.md` — exact setup and deployment steps

## What you need to replace

Only these placeholders:

### Frontend `.env`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_BACKEND_URL`

### Backend `.env`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `ANTHROPIC_API_KEY`
- `FRONTEND_URL`

## Quick start

### 1. Create the database
Run `sql/schema.sql` in the Supabase SQL editor.

### 2. Start backend
```bash
cd backend
npm install
cp .env.example .env
node server.js
```

### 3. Start frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Important notes

- The frontend now uses real Supabase auth and persistent data.
- Story generation is server-side only. The Anthropic key is never exposed in the browser.
- Stripe is handled by backend-created Checkout and Billing Portal sessions.
- Account deletion is handled securely on the backend through the Supabase admin API.
- The visual design follows the supplied HTML closely, but it is now componentized for React and ready for Android WebView/Cordova/Capacitor packaging later.
