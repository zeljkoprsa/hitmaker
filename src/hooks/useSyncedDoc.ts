import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  DocKey,
  LocalDoc,
  fetchRemoteDoc,
  loadLocalDoc,
  pushRemoteDoc,
  reconcile,
  saveLocalDoc,
} from '../utils/docSync';

const PUSH_DEBOUNCE_MS = 2000;

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline' | 'error';

interface SyncedDoc<T> {
  data: T[];
  /** Local-first setter: updates state and storage immediately, stamps a
   *  fresh updatedAt, and schedules a debounced background push. */
  setData: (updater: (prev: T[]) => T[]) => void;
  status: SyncStatus;
  /** True while signed in but the first successful pull since sign-in hasn't
   *  completed — i.e. remote items may exist that this device can't see yet. */
  initialSyncPending: boolean;
}

/**
 * Offline-first synced document. All reads and writes hit local state and
 * localStorage synchronously; Supabase sync happens in the background.
 * When `mergeItems` is provided the sets are unioned per item on conflict
 * rather than whole-doc overwritten (see utils/docSync.ts). Signed-out usage
 * stays purely local.
 */
export function useSyncedDoc<T>(
  docKey: DocKey,
  storageKey: string,
  mergeItems?: (local: T[], remote: T[]) => T[]
): SyncedDoc<T> {
  const [doc, setDoc] = useState<LocalDoc<T>>(() => loadLocalDoc<T>(storageKey));
  const [status, setStatus] = useState<SyncStatus>('local');
  const [initialSyncPending, setInitialSyncPending] = useState(false);
  const { user, cloudSyncEnabled } = useAuth();

  const syncEnabled = Boolean(user) && cloudSyncEnabled;
  const userId = user?.id;

  // Refs so reconcile/push callbacks never act on stale state
  const docRef = useRef(doc);
  docRef.current = doc;
  const mergeRef = useRef(mergeItems);
  mergeRef.current = mergeItems;
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist every doc change (local edits and applied remote docs alike)
  useEffect(() => {
    saveLocalDoc(storageKey, doc);
  }, [storageKey, doc]);

  const push = useCallback(async () => {
    if (!userId) return;
    const snapshot = docRef.current;
    const updatedAt = snapshot.updatedAt ?? new Date().toISOString();
    try {
      await pushRemoteDoc(supabase, userId, docKey, { data: snapshot.data, updatedAt });
      // Clear dirty only if nothing changed while the push was in flight
      setDoc(prev =>
        prev.updatedAt === snapshot.updatedAt ? { ...prev, updatedAt, dirty: false } : prev
      );
      setStatus('synced');
    } catch {
      setStatus(navigator.onLine ? 'error' : 'offline');
    }
  }, [userId, docKey]);

  const reconcileNow = useCallback(async () => {
    if (!userId) return;
    setStatus('syncing');
    try {
      const remote = await fetchRemoteDoc<T>(supabase, userId, docKey);
      const action = reconcile(docRef.current, remote, mergeRef.current);
      if (action.kind === 'push') {
        await push();
      } else if (action.kind === 'apply-remote') {
        setDoc({ data: action.data, updatedAt: action.updatedAt, dirty: false });
        setStatus('synced');
      } else if (action.kind === 'merge') {
        setDoc({ data: action.data, updatedAt: new Date().toISOString(), dirty: true });
        // The dirty flag makes the debounced push effect upload the merge
        setStatus('synced');
      } else {
        setStatus('synced');
      }
      setInitialSyncPending(false);
    } catch {
      setStatus(navigator.onLine ? 'error' : 'offline');
    }
  }, [userId, docKey, push]);

  // Pull + reconcile when a user signs in (or on load with a session)
  useEffect(() => {
    if (!syncEnabled) {
      setStatus('local');
      setInitialSyncPending(false);
      return;
    }
    setInitialSyncPending(true);
    reconcileNow();
  }, [syncEnabled, userId, reconcileNow]);

  // Reconcile on reconnect; offline changes queued as dirty push then
  useEffect(() => {
    if (!syncEnabled) return;
    const onOnline = () => reconcileNow();
    const onOffline = () => setStatus('offline');
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncEnabled, reconcileNow]);

  // Debounced background push of dirty local changes
  useEffect(() => {
    if (!syncEnabled || !doc.dirty) return;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      pushTimerRef.current = null;
      if (navigator.onLine) push();
      else setStatus('offline');
    }, PUSH_DEBOUNCE_MS);
    return () => {
      if (pushTimerRef.current) {
        clearTimeout(pushTimerRef.current);
        pushTimerRef.current = null;
      }
    };
  }, [syncEnabled, doc, push]);

  const setData = useCallback((updater: (prev: T[]) => T[]) => {
    setDoc(prev => {
      const next = updater(prev.data);
      // No-op updates (e.g. out-of-bounds reorder) shouldn't dirty the doc
      if (next === prev.data) return prev;
      return { data: next, updatedAt: new Date().toISOString(), dirty: true };
    });
  }, []);

  return { data: doc.data, setData, status, initialSyncPending };
}
