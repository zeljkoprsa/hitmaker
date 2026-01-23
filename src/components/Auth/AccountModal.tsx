import React from 'react';

import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../hooks/usePreferences';

import styles from './AuthModal.module.css'; // Reuse styles
// We might want specific styles for AccountModal later, but reusing for consistency now.

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const { preferences } = usePreferences();

  if (!isOpen || !user) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'metronome_preferences.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>Account</h2>
        </div>

        <div className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <div style={{ padding: '8px', color: 'var(--color-text-primary)' }}>{user.email}</div>
          </div>

          <div className={styles.inputGroup}>
            <label>Member Since</label>
            <div style={{ padding: '8px', color: 'var(--color-text-primary)' }}>
              {new Date(user.created_at || '').toLocaleDateString()}
            </div>
          </div>

          <button
            className={styles.button}
            onClick={handleExport}
            style={{ justifyContent: 'center', marginTop: '16px' }}
          >
            Export Preferences
          </button>

          <button
            className={styles.submitButton}
            onClick={handleSignOut}
            style={{ backgroundColor: 'var(--color-background-mid)', marginTop: '8px' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountModal;
