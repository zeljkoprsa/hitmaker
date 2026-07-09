import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { CATALOG_ITEMS } from '../features/Catalog/catalogItems';

import { useLessons } from './LessonContext';
import { useSession } from './SessionContext';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'hitmaker_queue';

export type QueueRefType = 'lesson' | 'starter' | 'session';

/** One entry in the practice queue. References its source by id rather than
 *  embedding it, so edits to a My Session are picked up at start time. */
export interface QueueItem {
  id: string;
  refType: QueueRefType;
  /** lesson/starter: CatalogItem id; session: PracticeSession id */
  refId: string;
  title: string;
  meta?: string;
}

const loadQueue = (): QueueItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueueItem[]) : [];
  } catch {
    return [];
  }
};

const persistQueue = (queue: QueueItem[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

interface QueueContextType {
  queue: QueueItem[];
  addToQueue: (item: Omit<QueueItem, 'id'>) => void;
  removeFromQueue: (id: string) => void;
  /** Move an item up (-1) or down (+1) one position. */
  moveItem: (id: string, direction: -1 | 1) => void;
  /** Start the head item: lessons open the lesson, starters/sessions start
   *  the session runner. Starters/sessions auto-complete when the runner
   *  finishes; lessons complete only via completeCurrent (Mark done). */
  startCurrent: () => void;
  /** Manually complete the head item and advance. */
  completeCurrent: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<QueueItem[]>(loadQueue);
  const { sessions, startSession, completionCount } = useSession();
  const { openLesson } = useLessons();
  const { showToast } = useToast();

  // Queue entry id whose session run is in flight (starter/session only)
  const startedItemIdRef = useRef<string | null>(null);
  const prevCompletionRef = useRef(completionCount);

  // Persist as an effect so setQueue updaters stay pure (React may invoke
  // them during render, twice in StrictMode).
  useEffect(() => {
    persistQueue(queue);
  }, [queue]);

  const addToQueue = useCallback(
    (item: Omit<QueueItem, 'id'>) => {
      setQueue(prev => [...prev, { ...item, id: crypto.randomUUID() }]);
      showToast(`Added to Queue: ${item.title}`, 'success');
    },
    [showToast]
  );

  const removeFromQueue = useCallback((id: string) => {
    if (startedItemIdRef.current === id) startedItemIdRef.current = null;
    setQueue(prev => prev.filter(q => q.id !== id));
  }, []);

  const moveItem = useCallback((id: string, direction: -1 | 1) => {
    setQueue(prev => {
      const index = prev.findIndex(q => q.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const completeCurrent = useCallback(() => {
    const head = queue[0];
    if (!head) return;
    if (startedItemIdRef.current === head.id) startedItemIdRef.current = null;
    setQueue(prev => (prev[0]?.id === head.id ? prev.slice(1) : prev));
    const next = queue[1];
    showToast(next ? `Done. Next up: ${next.title}` : 'Queue complete!', 'success');
  }, [queue, showToast]);

  const startCurrent = useCallback(() => {
    const head = queue[0];
    if (!head) return;

    if (head.refType === 'lesson') {
      const item = CATALOG_ITEMS.find(c => c.id === head.refId);
      if (!item?.lessonId) {
        showToast('Lesson no longer exists — removed from Queue', 'error');
        removeFromQueue(head.id);
        return;
      }
      openLesson(item.lessonId);
      return;
    }

    const session =
      head.refType === 'starter'
        ? CATALOG_ITEMS.find(c => c.id === head.refId)?.session
        : sessions.find(s => s.id === head.refId);

    if (!session) {
      showToast('Session no longer exists — removed from Queue', 'error');
      removeFromQueue(head.id);
      return;
    }

    startedItemIdRef.current = head.id;
    startSession(session);
  }, [queue, sessions, startSession, openLesson, removeFromQueue, showToast]);

  // Auto-advance: when a queue-started session runs to natural completion,
  // pop it off the queue. Manual endSession never increments completionCount,
  // so abandoned runs stay queued. The nonce guard makes re-runs from the
  // queue dependency no-ops.
  useEffect(() => {
    if (completionCount === prevCompletionRef.current) return;
    prevCompletionRef.current = completionCount;

    const startedId = startedItemIdRef.current;
    if (!startedId) return;
    startedItemIdRef.current = null;

    if (queue[0]?.id !== startedId) return;
    const next = queue.slice(1);
    setQueue(next);
    if (next[0]) showToast(`Next up: ${next[0].title}`, 'info');
  }, [completionCount, queue, showToast]);

  return (
    <QueueContext.Provider
      value={{ queue, addToQueue, removeFromQueue, moveItem, startCurrent, completeCurrent }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = (): QueueContextType => {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within a QueueProvider');
  return ctx;
};
