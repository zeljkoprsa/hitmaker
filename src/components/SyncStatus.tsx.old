import React, { useEffect, useState } from 'react';

import { useMetronome } from '../features/Metronome/context/MetronomeProvider';
// import { usePreferences } from '../hooks/usePreferences'; // Wait, usePreferences is per component instance usually, but we need the SAME saving state?
// Ah, usePreferences is a HOOK. If I use it in SyncStatus, it will have its OWN state unless it uses Context or SWR/React Query.
// Currently my usePreferences has LOCAL state (useState).
// This is a problem. The 'saving' state in MetronomeProvider is what matters.
// I need to expose 'saving' from MetronomeProvider Context or make usePreferences use a global store.
// EASIEST fix: Pass 'saving' prop to SyncStatus or expose it via MetronomeContext.
// MetronomeContext is already huge.
// Better: Move preferences state to a Context Provider (PreferencesContext).
// OR: Just add 'isSaving' to MetronomeContext since MetronomeProvider uses usePreferences.
// Let's add 'isSaving' to MetronomeContext.

// BUT, for now, I will assume I can access it via MetronomeContext if I update it.
// I haven't updated MetronomeContextType yet. I should do that first.

// Let's modify MetronomeContextType to include 'isSaving' and 'isOffline'.
// And update MetronomeProvider to pass 'saving' from 'usePreferences'.

const SyncStatus: React.FC = () => {
  const { isSaving } = useMetronome(); // I need to add this to context
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
      <div
        style={{
          color: 'var(--color-warning)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>Offline</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span
          className="spinner"
          style={{
            width: '12px',
            height: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        Saving...
      </div>
    );
  }

  return (
    <div
      style={{
        color: 'var(--color-success)',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      <span>Synced</span>
    </div>
  );
};

export default SyncStatus;
