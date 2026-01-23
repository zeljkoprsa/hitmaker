import React, { useState, useEffect } from 'react';

import { supabase } from '../../lib/supabase';

import styles from './AuthModal.module.css';

const ResetPasswordModal: React.FC = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Basic check to see if we are in a recovery flow
    // Supabase usually puts #access_token=...&type=recovery
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsOpen(true);
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage('Password updated successfully. You can now close this window.');
      // Optionally redirect or close
      setTimeout(() => {
        setIsOpen(false);
        window.location.hash = ''; // Clear hash
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Set New Password</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.message}>{message}</div>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
