import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { JournalEntry } from '../core/types/JournalTypes';
import { mergeEntries } from '../core/utils/journalEntry';
import { supabase } from '../lib/supabase';
import { fetchRemoteEntries, pushEntries } from '../utils/journalSync';

import { useAuth } from './AuthContext';

const STORAGE_KEY = 'hitmaker_journal';

const byEndedDesc = (a: JournalEntry, b: JournalEntry) =>
  new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime();

const loadLocal = (): JournalEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as JournalEntry[]) : [];
  } catch {
    return [];
  }
};

const saveLocal = (entries: JournalEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage unavailable — entries stay in memory this session
  }
};

interface JournalContextType {
  entries: JournalEntry[];
  /** Append a freshly-logged run and surface it for an optional reflection. */
  addEntry: (entry: JournalEntry) => void;
  /** Add/edit/clear an entry's reflection (empty string clears it). */
  updateReflection: (id: string, text: string) => void;
  /** The just-logged entry awaiting the optional post-run prompt, if any. */
  pendingReflection: JournalEntry | null;
  dismissReflection: () => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

/**
 * Practice journal store (spec #6). Local-first: localStorage is the source
 * of truth and the calendar works offline and signed-out. When signed in +
 * online, an outbox flushes unsynced entries (and reflection edits) to the
 * per-row `practice_journal` table, and sign-in/reconnect unions local with
 * remote by entry id — no whole-document last-write-wins, so nothing is lost.
 */
export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [entries, setEntries] = useState<JournalEntry[]>(loadLocal);
  const [pendingReflection, setPendingReflection] = useState<JournalEntry | null>(null);
  const { user, cloudSyncEnabled } = useAuth();

  const syncEnabled = Boolean(user) && cloudSyncEnabled;
  const userId = user?.id;

  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const flushingRef = useRef(false);

  useEffect(() => {
    saveLocal(entries);
  }, [entries]);

  const flushOutbox = useCallback(async () => {
    if (!syncEnabled || !userId || flushingRef.current || !navigator.onLine) return;
    const unsynced = entriesRef.current.filter(e => !e.synced);
    if (unsynced.length === 0) return;
    flushingRef.current = true;
    try {
      await pushEntries(supabase, userId, unsynced);
      const ids = new Set(unsynced.map(e => e.id));
      setEntries(prev => prev.map(e => (ids.has(e.id) ? { ...e, synced: true } : e)));
    } catch {
      // Keep unsynced; retry on next add / reconnect
    } finally {
      flushingRef.current = false;
    }
  }, [syncEnabled, userId]);

  const reconcile = useCallback(async () => {
    if (!syncEnabled || !userId) return;
    try {
      const remote = await fetchRemoteEntries(supabase, userId);
      setEntries(prev => mergeEntries(prev, remote).sort(byEndedDesc));
    } catch {
      // Offline / transient — local stays authoritative
    }
    flushOutbox();
  }, [syncEnabled, userId, flushOutbox]);

  // Reconcile on sign-in and on reconnect
  useEffect(() => {
    if (syncEnabled) reconcile();
  }, [syncEnabled, userId, reconcile]);

  useEffect(() => {
    if (!syncEnabled) return;
    const onOnline = () => reconcile();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [syncEnabled, reconcile]);

  const addEntry = useCallback(
    (entry: JournalEntry) => {
      setEntries(prev => [{ ...entry, synced: false }, ...prev].sort(byEndedDesc));
      setPendingReflection(entry);
      setTimeout(() => flushOutbox(), 0);
    },
    [flushOutbox]
  );

  const updateReflection = useCallback(
    (id: string, text: string) => {
      const trimmed = text.trim();
      setEntries(prev =>
        prev.map(e =>
          e.id === id
            ? {
                ...e,
                reflection: trimmed === '' ? undefined : trimmed,
                updatedAt: new Date().toISOString(),
                synced: false,
              }
            : e
        )
      );
      setTimeout(() => flushOutbox(), 0);
    },
    [flushOutbox]
  );

  const dismissReflection = useCallback(() => setPendingReflection(null), []);

  return (
    <JournalContext.Provider
      value={{ entries, addEntry, updateReflection, pendingReflection, dismissReflection }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = (): JournalContextType => {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used within a JournalProvider');
  return ctx;
};
