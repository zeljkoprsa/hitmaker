import React, { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';

import styles from './SignInBanner.module.css';

interface SignInBannerProps {
  onSignInClick: () => void;
}

const DISMISS_COUNT_KEY = 'signin_banner_dismiss_count';
const MAX_DISMISSALS = 3;

export const SignInBanner: React.FC<SignInBannerProps> = ({ onSignInClick }) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Don't show if user is already logged in
    if (user) {
      setShouldShow(false);
      return;
    }

    // Check dismiss count
    const dismissCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10);
    if (dismissCount >= MAX_DISMISSALS) {
      setShouldShow(false);
      return;
    }

    setShouldShow(true);
  }, [user]);

  useEffect(() => {
    if (shouldShow) {
      // Slide in after a brief delay
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  useEffect(() => {
    if (isVisible) {
      // Auto-dismiss after 15 seconds
      const timer = setTimeout(() => handleDismiss(), 15000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);

    // Increment dismiss count
    const dismissCount = parseInt(localStorage.getItem(DISMISS_COUNT_KEY) || '0', 10);
    localStorage.setItem(DISMISS_COUNT_KEY, String(dismissCount + 1));

    // After animation, hide completely
    setTimeout(() => setShouldShow(false), 300);
  };

  const handleSignIn = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldShow(false);
      onSignInClick();
    }, 300);
  };

  if (!shouldShow) return null;

  return (
    <div className={`${styles.banner} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.content}>
        <div className={styles.icon}>💾</div>
        <div className={styles.message}>
          <strong>Save your settings across devices</strong>
          <span>Sign in to sync your preferences automatically</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.signInButton} onClick={handleSignIn}>
            Sign In
          </button>
          <button className={styles.dismissButton} onClick={handleDismiss} aria-label="Dismiss">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
