import { useCallback, useEffect, useRef, useState } from 'react';

const PULL_THRESHOLD = 80; // px to trigger reload
const isTouchDevice = () => 'ontouchstart' in window;

export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [pullProgress, setPullProgress] = useState(0); // 0–1
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const pullProgressRef = useRef(0);

  // Listen for SW update events dispatched by index.tsx
  useEffect(() => {
    const handler = (event: Event) => {
      const reg = (event as CustomEvent<ServiceWorkerRegistration>).detail;
      registrationRef.current = reg;
      setUpdateAvailable(true);
    };
    window.addEventListener('swUpdateAvailable', handler);
    return () => window.removeEventListener('swUpdateAvailable', handler);
  }, []);

  const applyUpdate = useCallback(() => {
    const waiting = registrationRef.current?.waiting;
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  }, []);

  // Pull-to-refresh gesture (touch devices only)
  useEffect(() => {
    if (!isTouchDevice()) return;

    const onTouchStart = (e: TouchEvent) => {
      const scrollTop = document.scrollingElement?.scrollTop ?? 0;
      touchStartYRef.current = scrollTop === 0 ? e.touches[0].clientY : null;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      const delta = e.touches[0].clientY - touchStartYRef.current;
      if (delta > 0) {
        const next = Math.min(delta / PULL_THRESHOLD, 1);
        pullProgressRef.current = next;
        setPullProgress(next);
      }
    };

    const onTouchEnd = () => {
      if (touchStartYRef.current === null) return;
      const progress = pullProgressRef.current;
      touchStartYRef.current = null;
      pullProgressRef.current = 0;
      setPullProgress(0);
      if (progress >= 1) {
        applyUpdate();
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [applyUpdate]);

  return { updateAvailable, applyUpdate, pullProgress };
}
