import { useEffect, useRef } from 'react';

/**
 * Hook to request a screen wake lock using the Screen Wake Lock API.
 * Keeps the screen active while `enabled` is true.
 * Automatically re-acquires the lock if visibility changes (e.g. user switches apps and comes back).
 */
export const useWakeLock = (enabled: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    // Determine if the browser supports Wake Lock
    if (!('wakeLock' in navigator)) {
      console.warn('Screen Wake Lock API is not supported in this browser.');
      return;
    }

    const requestLock = async () => {
      try {
        if (!wakeLockRef.current) {
          const lock = await navigator.wakeLock.request('screen');
          wakeLockRef.current = lock;

          lock.addEventListener('release', () => {
            // console.log('Wake Lock released');
            wakeLockRef.current = null;
          });
          // console.log('Wake Lock acquired');
        }
      } catch (err) {
        console.error(
          `Failed to acquire Wake Lock: ${(err as Error).name}, ${(err as Error).message}`
        );
      }
    };

    const releaseLock = async () => {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    // If enabled, request lock.
    if (enabled) {
      requestLock();
    } else {
      // If disabled, release lock.
      releaseLock();
    }

    // Re-acquire lock when page visibility changes (e.g., maximizing window, switching tabs)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && enabled && !wakeLockRef.current) {
        await requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseLock();
    };
  }, [enabled]);
};
