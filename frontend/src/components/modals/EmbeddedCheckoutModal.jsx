import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../app/AppContext';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

export default function EmbeddedCheckoutModal() {
  const app = useApp();

  if (!app.checkoutModalOpen || !app.checkoutClientSecret) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-3 py-6 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 22, scale: 0.96 }}
          className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-white p-3 shadow-2xl sm:p-5"
        >
          <button
            onClick={() => {
              app.setCheckoutModalOpen(false);
              app.setCheckoutClientSecret('');
            }}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg"
            aria-label="Close checkout"
          >
            ✕
          </button>

          <div className="mb-3 rounded-2xl bg-[#17143f] px-4 py-4 text-white">
            <div className="text-sm font-extrabold uppercase tracking-[0.12em] text-moon">
              Secure checkout
            </div>
            <div className="mt-1 text-sm text-white/80">
              Your 3-day free trial starts today. You will be charged
              automatically after the trial ends unless you cancel.
            </div>
          </div>

          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret: app.checkoutClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}