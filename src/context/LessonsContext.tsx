import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Lesson } from '../core/types/LessonTypes';
import { SessionBlock, SessionSection } from '../core/types/SessionTypes';
import { liveLessons, mergeLessons, withSeed } from '../core/utils/lessonStore';
import { supabase } from '../lib/supabase';
import { fetchRemoteLessons, pushLessons } from '../utils/lessonSync';

import { useAuth } from './AuthContext';

const STORAGE_KEY = 'hitmaker_lessons';

const loadLocal = (): Lesson[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Lesson[]) : [];
  } catch {
    return [];
  }
};

const saveLocal = (lessons: Lesson[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  } catch {
    // Storage unavailable — lessons stay in memory this session
  }
};

export interface LessonDraft {
  name: string;
  lessonNumber?: string;
  sections: SessionSection[];
  blocks: SessionBlock[];
}

interface LessonsContextType {
  /** Live (non-tombstoned) lessons in display order. */
  lessons: Lesson[];
  getLesson: (id: string) => Lesson | undefined;
  createLesson: (draft: LessonDraft) => Lesson;
  updateLesson: (id: string, draft: LessonDraft) => void;
  /** Soft delete: sets a synced tombstone so the deletion roams. */
  deleteLesson: (id: string) => void;
}

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

/**
 * Lessons store (spec #7). Local-first like the journal: localStorage is the
 * source of truth, the catalog works offline and signed-out. When signed in +
 * online, an outbox flushes unsynced rows (creates, edits, tombstones) to the
 * per-row `lessons` table, and sign-in/reconnect unions local with remote by
 * lesson id with per-row updatedAt LWW — no whole-document replacement.
 */
export const LessonsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [all, setAll] = useState<Lesson[]>(() => withSeed(loadLocal()));
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
    const unsynced = allRef.current.filter(l => !l.synced);
    if (unsynced.length === 0) return;
    flushingRef.current = true;
    try {
      await pushLessons(supabase, userId, unsynced);
      const ids = new Set(unsynced.map(l => l.id));
      setAll(prev => prev.map(l => (ids.has(l.id) ? { ...l, synced: true } : l)));
    } catch {
      // Keep unsynced; retry on next mutation / reconnect
    } finally {
      flushingRef.current = false;
    }
  }, [syncEnabled, userId]);

  const reconcile = useCallback(async () => {
    if (!syncEnabled || !userId) return;
    try {
      const remote = await fetchRemoteLessons(supabase, userId);
      setAll(prev => mergeLessons(prev, remote));
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

  const createLesson = useCallback(
    (draft: LessonDraft): Lesson => {
      const now = new Date().toISOString();
      const lesson: Lesson = {
        id: crypto.randomUUID(),
        name: draft.name,
        lessonNumber: draft.lessonNumber,
        guided: true,
        sections: draft.sections,
        blocks: draft.blocks,
        createdAt: now,
        updatedAt: now,
        synced: false,
      };
      setAll(prev => [...prev, lesson]);
      setTimeout(() => flushOutbox(), 0);
      return lesson;
    },
    [flushOutbox]
  );

  const updateLesson = useCallback(
    (id: string, draft: LessonDraft) => {
      const now = new Date().toISOString();
      setAll(prev =>
        prev.map(l =>
          l.id === id
            ? {
                ...l,
                name: draft.name,
                lessonNumber: draft.lessonNumber,
                sections: draft.sections,
                blocks: draft.blocks,
                updatedAt: now,
                synced: false,
              }
            : l
        )
      );
      setTimeout(() => flushOutbox(), 0);
    },
    [flushOutbox]
  );

  const deleteLesson = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setAll(prev =>
        prev.map(l => (l.id === id ? { ...l, deletedAt: now, updatedAt: now, synced: false } : l))
      );
      setTimeout(() => flushOutbox(), 0);
    },
    [flushOutbox]
  );

  const lessons = useMemo(() => liveLessons(all), [all]);

  const getLesson = useCallback((id: string) => lessons.find(l => l.id === id), [lessons]);

  return (
    <LessonsContext.Provider
      value={{ lessons, getLesson, createLesson, updateLesson, deleteLesson }}
    >
      {children}
    </LessonsContext.Provider>
  );
};

export const useLessonsStore = (): LessonsContextType => {
  const ctx = useContext(LessonsContext);
  if (!ctx) throw new Error('useLessonsStore must be used within a LessonsProvider');
  return ctx;
};
