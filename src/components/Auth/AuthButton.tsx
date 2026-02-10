import React, { useState, useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';

// eslint-disable-next-line import/order
import styles from './AuthButton.module.css';
// eslint-disable-next-line import/order
import AccountModal from './AccountModal';
// eslint-disable-next-line import/order
import AuthModal from './AuthModal';

const AuthButton: React.FC = () => {
  const { user, loading } = useAuth();
  const { isSaving } = useMetronome();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return <div className={styles.placeholder} />;
  }

  const getSyncStatusClass = () => {
    if (!user) return '';
    if (!online) return styles.statusOffline;
    if (isSaving) return styles.statusSyncing;
    return styles.statusSynced;
  };

  return (
    <>
      <button
        className={styles.button}
        onClick={() => {
          if (user) {
            setShowAccountModal(true);
          } else {
            setShowAuthModal(true);
          }
        }}
        aria-label={user ? 'Account Settings' : 'Sign In'}
      >
        {user ? (
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>{user.email ? user.email[0].toUpperCase() : 'U'}</div>
            <div className={`${styles.syncIndicator} ${getSyncStatusClass()}`} />
          </div>
        ) : (
          <span className={styles.signInText}>Sign In</span>
        )}
      </button>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {user && (
        <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />
      )}
    </>
  );
};

export default AuthButton;
