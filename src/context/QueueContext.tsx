import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { CATALOG_ITEMS } from '../features/Catalog/catalogItems';
import { useSyncedDoc } from '../hooks/useSyncedDoc';

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

interface QueueContextType {
  queue: QueueItem[];
  addToQueue: (item: Omit<QueueItem, 'id'>) => void;
  removeFromQueue: (id: string) => void;
  /** Move an item up (-1) or down (+1) one position. */
  moveItem: (id: string, direction: -1 | 1) => void;
  /** A queued My Session whose session hasn't arrived on this device yet
   *  (sessions sync still pending). Shown as a placeholder and skipped by
   *  start/auto-advance until it resolves; never silently dropped. */
  isItemPending: (item: QueueItem) => boolean;
  /** Id of the first startable (non-pending) item, or null. */
  currentItemId: string | null;
  /** Start the current item: lessons open the lesson, starters/sessions
   *  start the session runner. Starters/sessions auto-complete when the
   *  runner finishes; lessons complete only via completeCurrent (Mark done). */
  startCurrent: () => void;
  /** Manually complete the current item and advance. */
  completeCurrent: () => void;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: queue, setData: setQueue } = useSyncedDoc<QueueItem>('queue', STORAGE_KEY);
  const { sessions, startSession, completionCount, sessionsSyncPending } = useSession();
  const { openLesson } = useLessons();
  const { showToast } = useToast();

  // Queue entry id whose session run is in flight (starter/session only)
  const startedItemIdRef = useRef<string | null>(null);
  const prevCompletionRef = useRef(completionCount);

  const isItemPending = useCallback(
    (item: QueueItem): boolean =>
      item.refType === 'session' && sessionsSyncPending && !sessions.some(s => s.id === item.refId),
    [sessions, sessionsSyncPending]
  );

  const currentItem = useMemo(
    () => queue.find(q => !isItemPending(q)) ?? null,
    [queue, isItemPending]
  );

  const addToQueue = useCallback(
    (item: Omit<QueueItem, 'id'>) => {
      setQueue(prev => [...prev, { ...item, id: crypto.randomUUID() }]);
      showToast(`Added to Queue: ${item.title}`, 'success');
    },
    [setQueue, showToast]
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      if (startedItemIdRef.current === id) startedItemIdRef.current = null;
      setQueue(prev => prev.filter(q => q.id !== id));
    },
    [setQueue]
  );

  const moveItem = useCallback(
    (id: string, direction: -1 | 1) => {
      setQueue(prev => {
        const index = prev.findIndex(q => q.id === id);
        const target = index + direction;
        if (index === -1 || target < 0 || target >= prev.length) return prev;
        const next = [...prev];
        [next[index], next[target]] = [next[target], next[index]];
        return next;
      });
    },
    [setQueue]
  );

  const completeCurrent = useCallback(() => {
    if (!currentItem) return;
    if (startedItemIdRef.current === currentItem.id) startedItemIdRef.current = null;
    const remaining = queue.filter(q => q.id !== currentItem.id);
    setQueue(prev => prev.filter(q => q.id !== currentItem.id));
    const next = remaining.find(q => !isItemPending(q));
    showToast(next ? `Done. Next up: ${next.title}` : 'Queue complete!', 'success');
  }, [currentItem, queue, isItemPending, setQueue, showToast]);

  const startCurrent = useCallback(() => {
    if (!currentItem) return;

    if (currentItem.refType === 'lesson') {
      const item = CATALOG_ITEMS.find(c => c.id === currentItem.refId);
      if (!item?.lessonId) {
        showToast('Lesson no longer exists — removed from Queue', 'error');
        removeFromQueue(currentItem.id);
        return;
      }
      openLesson(item.lessonId);
      return;
    }

    const session =
      currentItem.refType === 'starter'
        ? CATALOG_ITEMS.find(c => c.id === currentItem.refId)?.session
        : sessions.find(s => s.id === currentItem.refId);

    if (!session) {
      // Not a pending sync case (currentItem skips those) — genuinely gone,
      // e.g. deleted on another device.
      showToast('Session no longer exists — removed from Queue', 'error');
      removeFromQueue(currentItem.id);
      return;
    }

    startedItemIdRef.current = currentItem.id;
    startSession(session);
  }, [currentItem, sessions, startSession, openLesson, removeFromQueue, showToast]);

  // Auto-advance: when a queue-started session runs to natural completion,
  // remove that entry (wherever it sits — pending placeholders above it stay
  // put and are skipped, not dropped). Manual endSession never increments
  // completionCount, so abandoned runs stay queued. The nonce guard makes
  // re-runs from the queue dependency no-ops.
  useEffect(() => {
    if (completionCount === prevCompletionRef.current) return;
    prevCompletionRef.current = completionCount;

    const startedId = startedItemIdRef.current;
    if (!startedId) return;
    startedItemIdRef.current = null;

    if (!queue.some(q => q.id === startedId)) return;
    const remaining = queue.filter(q => q.id !== startedId);
    setQueue(prev => prev.filter(q => q.id !== startedId));
    const next = remaining.find(q => !isItemPending(q));
    if (next) showToast(`Next up: ${next.title}`, 'info');
  }, [completionCount, queue, isItemPending, setQueue, showToast]);

  return (
    <QueueContext.Provider
      value={{
        queue,
        addToQueue,
        removeFromQueue,
        moveItem,
        isItemPending,
        currentItemId: currentItem?.id ?? null,
        startCurrent,
        completeCurrent,
      }}
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
