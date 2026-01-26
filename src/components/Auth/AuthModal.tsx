import React, { useState } from 'react';

import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';

import styles from './AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'signin' }) => {
  const [view, setView] = useState<'signin' | 'signup' | 'forgot_password'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        showToast('Successfully signed in', 'success');
        onClose();
      } else if (view === 'signup') {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && data.session === null) {
          setMessage('Check your email for the confirmation link.');
          showToast('Account created! Please verify your email.', 'info');
        } else {
          showToast('Account created successfully', 'success');
          onClose();
        }
      } else if (view === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        });
        if (error) throw error;
        setMessage('Check your email for the password reset link.');
        showToast('Password reset link sent', 'success');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>
            {view === 'signin'
              ? 'Sign In'
              : view === 'signup'
                ? 'Create Account'
                : 'Reset Password'}
          </h2>
          {view !== 'forgot_password' && (
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${view === 'signin' ? styles.activeTab : ''}`}
                onClick={() => setView('signin')}
              >
                Sign In
              </button>
              <button
                className={`${styles.tab} ${view === 'signup' ? styles.activeTab : ''}`}
                onClick={() => setView('signup')}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>


        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          {view !== 'forgot_password' && (
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.message}>{message}</div>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? (
              <span className={styles.spinner} />
            ) : view === 'signin' ? (
              'Sign In'
            ) : view === 'signup' ? (
              'Create Account'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          {view === 'signin' && (
            <button className={styles.linkButton} onClick={() => setView('forgot_password')}>
              Forgot Password?
            </button>
          )}
          {view === 'forgot_password' && (
            <button className={styles.linkButton} onClick={() => setView('signin')}>
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
