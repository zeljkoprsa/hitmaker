import { Lesson } from '../../core/types/LessonTypes';
import { PracticeSession } from '../../core/types/SessionTypes';
import { WORKOUT_SESSIONS } from '../Sessions/workoutSessions';

export type CatalogItemType = 'lesson' | 'workout';

/** A unified Catalog entry. Lessons and workouts share one list; the type
 *  field drives filtering and which actions each row offers. */
export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  title: string;
  /** Display metadata line: "Lesson 01 · 8 blocks · 29 min" / "4 blocks · 16 min" */
  meta: string;
  /** Lessons: id understood by LessonContext.openLesson (the lesson's store id) */
  lessonId?: string;
  /** Lessons: manual sequence number, display-only ("01") */
  lessonNumber?: string;
  /** Workouts: the underlying block-based session.
   *  Lessons: the guided run (session.guided = true). */
  session?: PracticeSession;
}

const blocksMeta = (s: PracticeSession): string => {
  const total = s.blocks.reduce((sum, b) => sum + b.durationMinutes, 0);
  const blockLabel = s.blocks.length === 1 ? '1 block' : `${s.blocks.length} blocks`;
  return `${blockLabel} · ${Math.round(total)} min`;
};

const lessonMeta = (l: Lesson): string =>
  l.lessonNumber ? `Lesson ${l.lessonNumber} · ${blocksMeta(l)}` : `Lesson · ${blocksMeta(l)}`;

/** Lessons first (sequenced curriculum), then workouts. Lessons come from
 *  the store (spec #7) — this is a pure projection, no module-level list. */
export const buildCatalogItems = (lessons: Lesson[]): CatalogItem[] => [
  ...lessons.map(
    (l): CatalogItem => ({
      id: l.id,
      type: 'lesson',
      title: l.name,
      meta: lessonMeta(l),
      lessonNumber: l.lessonNumber,
      lessonId: l.id,
      session: l,
    })
  ),
  ...WORKOUT_SESSIONS.map(
    (s): CatalogItem => ({
      id: s.id,
      type: 'workout',
      title: s.name,
      meta: blocksMeta(s),
      session: s,
    })
  ),
];
