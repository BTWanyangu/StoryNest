// src/components/ResetPassword.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function ResetPassword({ onBackToLogin }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function prepareRecoverySession() {
      setError('');
      setNotice('');
      setCheckingSession(true);

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.replace(/^#/, '')
        );

        const code = searchParams.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        /**
         * Supabase may send password reset links in two formats:
         *
         * 1. PKCE format:
         *    /reset-password?code=xxxx
         *
         * 2. Token hash format:
         *    /reset-password#access_token=xxx&refresh_token=xxx
         *
         * We support both before calling updateUser().
         */

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            throw exchangeError;
          }

          window.history.replaceState({}, '', '/reset-password');
          setRecoveryReady(true);
          return;
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          window.history.replaceState({}, '', '/reset-password');
          setRecoveryReady(true);
          return;
        }

        /**
         * Fallback: sometimes Supabase has already detected the session
         * from the URL before this component loads.
         */
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setRecoveryReady(true);
          return;
        }

        setRecoveryReady(false);
        setError(
          'This reset link is missing, expired, or has already been used. Please request a new password reset link.'
        );
      } catch (err) {
        console.error(err);
        setRecoveryReady(false);
        setError(
          err.message ||
            'Could not verify your reset link. Please request a new password reset link.'
        );
      } finally {
        setCheckingSession(false);
      }
    }

    prepareRecoverySession();
  }, []);

  const goBackToLogin = async () => {
    await supabase.auth.signOut();

    if (typeof onBackToLogin === 'function') {
      onBackToLogin();
      return;
    }

    window.location.href = '/login';
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!recoveryReady) {
      setError(
        'Your reset session is not active. Please request a new password reset link.'
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(
        updateError.message ||
          'Could not update password. Please request a new reset link.'
      );
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setRecoveryReady(false);
    setNotice(
      'Password updated successfully. You can now sign in with your new password.'
    );

    setTimeout(async () => {
      await supabase.auth.signOut();
      window.history.replaceState({}, '', '/login');

      if (typeof onBackToLogin === 'function') {
        onBackToLogin();
      } else {
        window.location.href = '/login';
      }
    }, 1500);
  };

  if (checkingSession) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md rounded-xl2 border border-white/10 bg-card p-6 text-center sm:p-8"
        >
          <div className="mb-3 text-5xl">🔐</div>
          <h2 className="font-display text-2xl text-moon sm:text-3xl">
            Checking reset link
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Please wait while we verify your password reset session.
          </p>
        </motion.div>
      </main>
    );
  }

  if (!recoveryReady && error) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-md rounded-xl2 border border-white/10 bg-card p-6 text-center sm:p-8"
        >
          <div className="mb-3 text-5xl">⚠️</div>

          <h2 className="font-display text-2xl text-moon sm:text-3xl">
            Reset link problem
          </h2>

          <div className="mt-4 rounded-lg border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </div>

          <button
            type="button"
            onClick={goBackToLogin}
            className="mt-5 w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-base font-bold text-white shadow-purple"
          >
            Back to sign in
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <motion.form
        onSubmit={handleResetPassword}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-xl2 border border-white/10 bg-card p-6 sm:p-8"
      >
        <div className="mb-5 text-center">
          <div className="mb-3 text-5xl">🔐</div>
          <h2 className="font-display text-2xl text-moon sm:text-3xl">
            Reset your password
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enter a new password for your Moonspun account.
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
            New password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.06em] text-purple3">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-sm2 border border-white/10 bg-night3 px-4 py-3 text-text outline-none transition focus:border-purple2"
            placeholder="Repeat your new password"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-coral/20 bg-coral/10 px-4 py-3 text-sm text-coral">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-4 rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm text-green-300">
            {notice}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-full bg-gradient-to-br from-purple to-purple2 px-5 py-3 text-base font-bold text-white shadow-purple disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Updating password...' : 'Update password'}
        </motion.button>

        <button
          type="button"
          onClick={goBackToLogin}
          className="mt-4 w-full text-center text-sm font-bold text-purple3 underline"
        >
          Back to sign in
        </button>
      </motion.form>
    </main>
  );
}