import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { IntakeItem, IntakeStatus } from '../core/types/IntakeTypes';
import { detectSource, mergeItems, oembedUrl } from '../core/utils/intakeStore';
import { supabase } from '../lib/supabase';
import { fetchRemoteItems, pushItems } from '../utils/intakeSync';

import { useAuth } from './AuthContext';

const STORAGE_KEY = 'hitmaker_intake';

const loadLocal = (): IntakeItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as IntakeItem[]) : [];
  } catch {
    return [];
  }
};

const saveLocal = (items: IntakeItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable — items stay in memory this session
  }
};

export interface CaptureDraft {
  url: string;
  title?: string;
  note?: string;
}

interface IntakeContextType {
  /** All non-tombstoned items (every status); views filter by status. */
  items: IntakeItem[];
  /** Capture a URL. Instant and non-blocking: YouTube title/thumbnail are
   *  enriched asynchronously when oEmbed answers; failures change nothing. */
  addItem: (draft: CaptureDraft) => IntakeItem;
  updateItem: (id: string, changes: Pick<IntakeItem, 'title' | 'note'>) => void;
  /** Status moves: discard, restore, or mark distilled (with the lesson). */
  setStatus: (id: string, status: IntakeStatus, lessonId?: string) => void;
  /** Soft delete: sets a synced tombstone so the deletion roams. */
  deleteItem: (id: string) => void;
}

const IntakeContext = createContext<IntakeContextType | undefined>(undefined);

/**
 * Intake inbox store (spec #9). Local-first like lessons/journal:
 * localStorage is the source of truth, capture works offline and signed-out.
 * When signed in + online, an outbox flushes unsynced rows to the per-row
 * `intake_items` table; sign-in/reconnect unions local with remote by item
 * id with per-row updatedAt LWW.
 */
export const IntakeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [all, setAll] = useState<IntakeItem[]>(loadLocal);
  const { user, cloudSyncEnabled } = useAuth();

  const syncEnabled = Boolean(user) && cloudSyncEnabled;
  const userId = user?.id;

  const allRef = useRef(all);
  allRef.current = all;
  const flushingRef = useRef(false);

  useEffect(() => {
    saveLocal(all);
  }, [all]);

  const flushOutbox = useCallback(async () => {
    if (!syncEnabled || !userId || flushingRef.current || !navigator.onLine) return;
    const unsynced = allRef.current.filter(i => !i.synced);
    if (unsynced.length === 0) return;
    flushingRef.current = true;
    try {
      await pushItems(supabase, userId, unsynced);
      const ids = new Set(unsynced.map(i => i.id));
      setAll(prev => prev.map(i => (ids.has(i.id) ? { ...i, synced: true } : i)));
    } catch {
      // Keep unsynced; retry on next mutation / reconnect
    } finally {
      flushingRef.current = false;
    }
  }, [syncEnabled, userId]);

  const reconcile = useCallback(async () => {
    if (!syncEnabled || !userId) return;
    try {
      const remote = await fetchRemoteItems(supabase, userId);
      setAll(prev => mergeItems(prev, remote));
    } catch {
      // Offline / transient — local stays authoritative
    }
    flushOutbox();
  }, [syncEnabled, userId, flushOutbox]);

  useEffect(() => {
    if (syncEnabled) reconcile();
  }, [syncEnabled, userId, reconcile]);

  useEffect(() => {
    if (!syncEnabled) return;
    const onOnline = () => reconcile();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [syncEnabled, reconcile]);

  /** Fill title/thumbnail from oEmbed unless the user typed a title first. */
  const enrichFromOembed = useCallback(
    async (id: string, url: string) => {
      try {
        const res = await fetch(oembedUrl(url));
        if (!res.ok) return;
        const meta = (await res.json()) as { title?: string; thumbnail_url?: string };
        setAll(prev =>
          prev.map(i =>
            i.id === id
              ? {
                  ...i,
                  title: i.title || meta.title || undefined,
                  thumbnailUrl: meta.thumbnail_url,
                  updatedAt: new Date().toISOString(),
                  synced: false,
                }
              : i
          )
        );
        setTimeout(() => flushOutbox(), 0);
      } catch {
        // Offline or oEmbed down — the captured URL is already safe
      }
    },
    [flushOutbox]
  );

  const addItem = useCallback(
    (draft: CaptureDraft): IntakeItem => {
      const now = new Date().toISOString();
      const source = detectSource(draft.url);
      const item: IntakeItem = {
        id: crypto.randomUUID(),
        url: draft.url,
        source,
        title: draft.title?.trim() || undefined,
        note: draft.note?.trim() || undefined,
        status: 'inbox',
        createdAt: now,
        updatedAt: now,
        synced: false,
      };
      setAll(prev => [...prev, item]);
      setTimeout(() => flushOutbox(), 0);
      if (source === 'youtube') enrichFromOembed(item.id, draft.url);
      return item;
    },
    [flushOutbox, enrichFromOembed]
  );

  const touch = useCallback(
    (id: string, changes: Partial<IntakeItem>) => {
      const now = new Date().toISOString();
      setAll(prev =>
        prev.map(i => (i.id === id ? { ...i, ...changes, updatedAt: now, synced: false } : i))
      );
      setTimeout(() => flushOutbox(), 0);
    },
    [flushOutbox]
  );

  const updateItem = useCallback(
    (id: string, changes: Pick<IntakeItem, 'title' | 'note'>) => {
      touch(id, {
        title: changes.title?.trim() || undefined,
        note: changes.note?.trim() || undefined,
      });
    },
    [touch]
  );

  const setStatus = useCallback(
    (id: string, status: IntakeStatus, lessonId?: string) => {
      touch(id, { status, ...(lessonId !== undefined ? { lessonId } : {}) });
    },
    [touch]
  );

  const deleteItem = useCallback(
    (id: string) => {
      touch(id, { deletedAt: new Date().toISOString() });
    },
    [touch]
  );

  const items = useMemo(() => all.filter(i => !i.deletedAt), [all]);

  return (
    <IntakeContext.Provider value={{ items, addItem, updateItem, setStatus, deleteItem }}>
      {children}
    </IntakeContext.Provider>
  );
};

export const useIntake = (): IntakeContextType => {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error('useIntake must be used within an IntakeProvider');
  return ctx;
};
