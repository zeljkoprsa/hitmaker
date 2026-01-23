import React, { useEffect, useState } from 'react';

import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';

import { StatusContainer, StatusText, Spinner } from './styles';

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

  if (!online) {
    return (
      <StatusContainer status="offline">
        <StatusText>Offline</StatusText>
      </StatusContainer>
    );
  }

  if (isSaving) {
    return (
      <StatusContainer status="saving">
        <Spinner />
        <StatusText>Saving...</StatusText>
      </StatusContainer>
    );
  }

  return (
    <StatusContainer status="synced">
      <StatusText>Synced</StatusText>
    </StatusContainer>
  );
};

export default SyncStatus;
