import React, { useEffect, useState } from 'react';

import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';

import { StatusDot } from './styles';

const SyncStatus: React.FC = () => {
  const { isSaving } = useMetronome();
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

  const getStatus = () => {
    if (!online) return 'offline';
    if (isSaving) return 'saving';
    return 'synced';
  };

  const status = getStatus();

  const getTitle = () => {
    switch (status) {
      case 'offline':
        return 'Offline';
      case 'saving':
        return 'Saving...';
      case 'synced':
        return 'Synced';
    }
  };

  return <StatusDot status={status} title={getTitle()} aria-label={getTitle()} />;
};

export default SyncStatus;
