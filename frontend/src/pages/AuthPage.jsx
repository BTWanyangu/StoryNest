import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../app/AppContext';
import { MotionButton } from '../components/shared/UI';

export default function AuthPage({ mode }) {
  const app = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    app.setAuthMode(mode);
    app.setAuthError('');
    app.setAuthNotice('');
  }, [mode]);

  const authMode = app.authMode;

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-xl2 border border-white/10 bg-card p-6 sm:p-8"
      >
        <h2 className="mb-1 text-center font-display text-2xl text-moon sm:text-3xl">
          {authMode === 'signup'
            ? 'Create your account'
            : authMode === 'forgot'
            ? 'Reset your password'
            : 'Welcome back'}
        </h2>

        <p className="mb-7 text-center text-sm text-muted">
          {authMode === 'signup'
            ? 'Start your 3-day trial.'
            : authMode === 'forgot'
            ? 'Enter your email and we will send a password reset link.'
            : 'Sign in to access your stories.'}
        </p>

        {/* Name (signup only) */}
        {authMode === 'signup' && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
              Your name
            </label>
            <input
              value={app.authForm.name}
              onChange={(e) =>
                app.setAuthForm((p) => ({
                  ...p,
                  name: e.target.value,
                }))
              }
              className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="Your name"
            />
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
            Email
          </label>
          <input
            value={app.authForm.email}
            onChange={(e) =>
              app.setAuthForm((p) => ({
                ...p,
                email: e.target.value,
              }))
            }
            className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        {authMode !== 'forgot' && (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
              Password
            </label>
            <input
              type="password"
              value={app.authForm.password}
              onChange={(e) =>
                app.setAuthForm((p) => ({
                  ...p,
                  password: e.target.value,
                }))
              }
              className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none focus:border-purple2"
              placeholder="At least 6 characters"
            />
          </div>
        )}

        {/* Consent (signup only) */}
        {authMode === 'signup' && (
          <label className="mb-4 flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted">
            <input
              type="checkbox"
              checked={app.authForm.parentConsent}
              onChange={(e) =>
                app.setAuthForm((p) => ({
                  ...p,
                  parentConsent: e.target.checked,
                }))
              }
              className="mt-1"
            />
            I confirm I am a parent or guardian and agree to the Privacy
            Policy and Terms.
          </label>
        )}

        {/* Errors / Notices */}
        {app.authError && (
          <div className="mb-4 rounded-lg border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {app.authError}
          </div>
        )}

        {app.authNotice && (
          <div className="mb-4 rounded-lg border border-moon/20 bg-moon/10 px-4 py-3 text-sm text-moon">
            {app.authNotice}
          </div>
        )}

        {/* Submit */}
        <MotionButton
          type="button"
          onClick={app.handleAuthSubmit}
          className="w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-base font-bold text-white shadow-purple"
        >
          {authMode === 'signup'
            ? 'Create account'
            : authMode === 'forgot'
            ? 'Send reset link'
            : 'Sign in'}
        </MotionButton>

        {/* Footer links */}
        <div className="mt-4 text-center text-sm text-muted">
          {authMode === 'login' && (
            <>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-purple3 underline"
              >
                Forgot password?
              </button>
              <span className="px-2">•</span>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-purple3 underline"
              >
                Start trial
              </button>
            </>
          )}

          {authMode === 'signup' && (
            <>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-purple3 underline"
              >
                Sign in
              </button>
            </>
          )}

          {authMode === 'forgot' && (
            <button
              onClick={() => navigate('/login')}
              className="text-purple3 underline"
            >
              Back to sign in
            </button>
          )}
        </div>
      </motion.div>
    </main>
  );
}