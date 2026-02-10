import React, { useEffect, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';
import { usePreferences } from '../../hooks/usePreferences';

import accountStyles from './AccountModal.module.css';
import styles from './AuthModal.module.css';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const { preferences } = usePreferences();
  const { isSaving, tempo, timeSignature, soundId } = useMetronome();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
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

  useEffect(() => {
    if (!isSaving && preferences) {
      setLastSyncTime(new Date());
    }
  }, [isSaving, preferences]);

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

  const getSyncStatus = () => {
    if (!online) return { icon: '⚠️', text: 'Offline', color: 'var(--color-warning)' };
    if (isSaving) return { icon: '🔄', text: 'Syncing...', color: 'var(--color-accent)' };
    return { icon: '✓', text: 'Synced', color: 'var(--color-success)' };
  };

  const getTimeAgo = (date: Date | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  };

  const syncStatus = getSyncStatus();

  // Get sound name from ID
  const getSoundName = (id: string) => {
    const soundNames: Record<string, string> = {
      'metronome-quartz': 'Quartz',
      'metronome-wood': 'Wood',
      'metronome-digital': 'Digital',
    };
    return soundNames[id] || id;
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
          {/* User Info Section */}
          <div className={accountStyles.section}>
            <div className={accountStyles.userInfo}>
              <div className={accountStyles.avatar}>
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div>
                <div className={accountStyles.email}>{user.email}</div>
                <div className={accountStyles.memberSince}>
                  Member since {new Date(user.created_at || '').toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Sync Status Section */}
          <div className={accountStyles.section}>
            <div className={accountStyles.sectionHeader}>☁️ Sync Status</div>
            <div className={accountStyles.syncStatus}>
              <span className={accountStyles.syncIcon} style={{ color: syncStatus.color }}>
                {syncStatus.icon}
              </span>
              <span style={{ color: syncStatus.color }}>{syncStatus.text}</span>
              {!isSaving && online && lastSyncTime && (
                <span className={accountStyles.syncTime}>{getTimeAgo(lastSyncTime)}</span>
              )}
            </div>
          </div>

          {/* Current Preferences Section */}
          <div className={accountStyles.section}>
            <div className={accountStyles.sectionHeader}>⚙️ Your Preferences</div>
            <div className={accountStyles.preferencesList}>
              <div className={accountStyles.preferenceItem}>
                <span className={accountStyles.prefLabel}>Tempo:</span>
                <span className={accountStyles.prefValue}>{tempo} BPM</span>
              </div>
              <div className={accountStyles.preferenceItem}>
                <span className={accountStyles.prefLabel}>Time Signature:</span>
                <span className={accountStyles.prefValue}>
                  {timeSignature.beats}/{timeSignature.noteValue}
                </span>
              </div>
              <div className={accountStyles.preferenceItem}>
                <span className={accountStyles.prefLabel}>Sound:</span>
                <span className={accountStyles.prefValue}>{getSoundName(soundId)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
