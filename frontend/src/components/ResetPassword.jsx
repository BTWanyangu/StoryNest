// src/components/ResetPassword.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function ResetPassword({ onBackToLogin }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

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
      setError(updateError.message || 'Could not update password. Please request a new reset link.');
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setNotice('Password updated successfully. You can now sign in with your new password.');

    setTimeout(async () => {
      await supabase.auth.signOut();
      window.history.replaceState({}, '', '/');
      if (typeof onBackToLogin === 'function') {
        onBackToLogin();
      }
    }, 1500);
  };

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
          onClick={onBackToLogin}
          className="mt-4 w-full text-center text-sm font-bold text-purple3 underline"
        >
          Back to sign in
        </button>
      </motion.form>
    </main>
  );
}