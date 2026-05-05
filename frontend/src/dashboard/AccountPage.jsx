import { motion } from 'framer-motion';
import { useApp } from '../app/AppContext';
import { classNames } from '../utils/storyUtils';
import {
  InfoRow,
  MotionButton,
  MotionCard,
  StatBox,
} from '../components/shared/UI';

export default function AccountPage() {
  const app = useApp();

  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className="mb-1 font-display text-2xl text-moon sm:text-3xl">
        Account
      </h2>

      <p className="mb-6 text-sm leading-6 text-muted">
        View your plan, usage, and billing controls.
      </p>

      {app.loadingAccount ? (
        <div className="text-sm text-muted">Loading account...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          {/* Left card */}
          <MotionCard className="rounded-xl2 border border-white/10 bg-card p-5 sm:p-6">
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatBox label="Stories" value={app.storiesGenerated} />
              <StatBox label="Saved" value={app.library.length} />
              <StatBox label="Children" value={app.profiles.length} />
            </div>

            <InfoRow
              label="Name"
              value={
                app.userRecord?.name ||
                app.user?.user_metadata?.name ||
                '—'
              }
            />
            <InfoRow
              label="Email"
              value={app.user?.email || '—'}
            />
            <InfoRow
              label="Member since"
              value={app.accountSince}
            />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <MotionButton
                onClick={app.signOut}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-text"
              >
                Sign out
              </MotionButton>

              {app.isPaidPlan && (
                <MotionButton
                  onClick={app.openBillingPortal}
                  className="rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-2.5 text-sm font-bold text-white"
                >
                  Manage billing
                </MotionButton>
              )}
            </div>

            <div className="mt-8 border-t border-coral/15 pt-6">
              <div className="mb-2 text-sm font-extrabold text-coral">
                Delete Account
              </div>
              <div className="mb-4 font-bold leading-6 text-white">
                Permanently deletes your account, child profiles, and
                data.
              </div>

              <MotionButton
                onClick={app.handleDeleteAccount}
                className="rounded-full border border-coral/25 bg-coral/10 px-5 py-2.5 text-sm font-bold text-coral"
              >
                Delete my account
              </MotionButton>
            </div>
          </MotionCard>

          {/* Right card */}
          <MotionCard className="rounded-xl2 border border-white/10 bg-card p-5 sm:p-6">
            <div className="mb-1 text-sm font-extrabold uppercase tracking-[0.06em] text-purple3">
              Current plan
            </div>

            <div className="mb-2 font-display text-2xl text-star">
              {app.currentPlan === 'pro_unlimited'
                ? 'Pro Unlimited'
                : app.currentPlan === 'pro'
                ? 'Pro'
                : 'Free Plan'}
            </div>

            <div className="mb-4 text-4xl font-extrabold text-moon">
              {app.planMeta.displayPrice}
              <span className="text-sm font-normal text-muted">
                /month
              </span>
            </div>

            {!app.isPaidPlan ? (
              <>
                <div className="mt-5 grid gap-3">
                  {['pro', 'pro_unlimited'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() =>
                        app.setSelectedCheckoutPlan(plan)
                      }
                      className={classNames(
                        'rounded-xl border px-4 py-3 text-left transition',
                        app.selectedCheckoutPlan === plan
                          ? 'border-moon bg-moon/10 text-moon'
                          : 'border-white/10 bg-night3 text-text'
                      )}
                    >
                      <div className="font-bold">
                        {plan === 'pro'
                          ? 'Pro · $8.99/mo'
                          : 'Pro Unlimited · $14.99/mo'}
                      </div>
                      <div className="text-xs text-muted">
                        3-day trial
                      </div>
                    </button>
                  ))}
                </div>

                <MotionButton
                  onClick={() =>
                    app.startCheckout(app.selectedCheckoutPlan)
                  }
                  className="mt-6 w-full rounded-full bg-gradient-to-br from-moon2 to-moon px-5 py-3 text-sm font-bold text-night"
                >
                  Start trial
                </MotionButton>
              </>
            ) : (
              <MotionButton
                onClick={app.openBillingPortal}
                className="mt-6 w-full rounded-full bg-white/10 px-5 py-3 text-sm font-bold text-text"
              >
                Manage subscription
              </MotionButton>
            )}
          </MotionCard>
        </div>
      )}
    </motion.section>
  );
}