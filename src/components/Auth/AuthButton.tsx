import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';

import AccountModal from './AccountModal';
import styles from './AuthButton.module.css';
import AuthModal from './AuthModal';

const AuthButton: React.FC = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  if (loading) {
    return <div className={styles.placeholder} />;
  }

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
          <div className={styles.avatar}>{user.email ? user.email[0].toUpperCase() : 'U'}</div>
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
