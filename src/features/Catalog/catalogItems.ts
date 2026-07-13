import { PracticeSession } from '../../core/types/SessionTypes';
import { GROOVE_IS_IN_THE_HEART } from '../Sessions/lessons/grooveIsInTheHeart';
import { WORKOUT_SESSIONS } from '../Sessions/workoutSessions';

export type CatalogItemType = 'lesson' | 'workout';

/** A unified Catalog entry. Lessons and workouts share one list; the type
 *  field drives filtering and which actions each row offers. */
export interface CatalogItem {
  id: string;
  type: CatalogItemType;
  title: string;
  /** Display metadata line: "Lesson 01 · Warm-up & Technique" / "4 blocks · 16 min" */
  meta: string;
  /** Lessons: id understood by LessonContext.openLesson */
  lessonId?: string;
  /** Lessons: internal sequence number, display-only ("01") */
  lessonNumber?: string;
  /** Workouts: the underlying block-based session.
   *  Lessons: the guided run (session.guided = true). */
  session?: PracticeSession;
}

const workoutMeta = (s: PracticeSession): string => {
  const total = s.blocks.reduce((sum, b) => sum + b.durationMinutes, 0);
  const blockLabel = s.blocks.length === 1 ? '1 block' : `${s.blocks.length} blocks`;
  return `${blockLabel} · ${total} min`;
};

const LESSON_ITEMS: CatalogItem[] = [
  {
    id: 'lesson-groove-is-in-the-heart',
    type: 'lesson',
    title: 'Groove Is In The Heart',
    meta: 'Lesson 01 · Warm-up & Technique',
    lessonNumber: '01',
    lessonId: 'groove-is-in-the-heart',
    session: GROOVE_IS_IN_THE_HEART,
  },
];

const WORKOUT_ITEMS: CatalogItem[] = WORKOUT_SESSIONS.map(s => ({
  id: s.id,
  type: 'workout',
  title: s.name,
  meta: workoutMeta(s),
  session: s,
}));

/** Lessons first (sequenced curriculum), then workouts. */
export const CATALOG_ITEMS: CatalogItem[] = [...LESSON_ITEMS, ...WORKOUT_ITEMS];
