import React, { useState, useEffect } from 'react';

import styles from './Auth/AuthModal.module.css'; // Reuse styles

const ONBOARDING_KEY = 'metronome_onboarding_seen';

const OnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeen) {
      // Small delay
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem(ONBOARDING_KEY, 'true');
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={handleDismiss}>
          &times;
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Welcome!</h2>
        </div>

        <div
          style={{ padding: '0 8px 16px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}
        >
          <p>Take your practice to the next level with our new sync features:</p>
          <ul style={{ paddingLeft: '20px', margin: '12px 0' }}>
            <li>Save your tempo and settings to the cloud.</li>
            <li>Sync across all your devices.</li>
            <li>Practice offline and sync when you return.</li>
          </ul>
        </div>

        <button className={styles.submitButton} onClick={handleDismiss}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
