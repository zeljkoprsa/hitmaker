import { useCallback, useState } from 'react';

/**
 * useState that survives sessions: initializes from localStorage and writes
 * back on every set (JAK-48 — input fields shouldn't reset to defaults).
 * Values must be JSON-serializable. Corrupt/missing storage falls back to
 * the provided initial value.
 */
export function usePersistentState<T>(
  storageKey: string,
  initial: T
): [T, (action: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  const setAndPersist = useCallback(
    (action: T | ((prev: T) => T)) => {
      setValue(prev => {
        const next = action instanceof Function ? action(prev) : action;
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Storage full/unavailable — keep working in-memory
        }
        return next;
      });
    },
    [storageKey]
  );

  return [value, setAndPersist];
}
