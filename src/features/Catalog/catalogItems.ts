import { PracticeSession } from '../../core/types/SessionTypes';
import { GROOVE_IS_IN_THE_HEART } from '../Sessions/lessons/grooveIsInTheHeart';
import { STARTER_SESSIONS } from '../Sessions/starterSessions';

export type CatalogItemType = 'lesson' | 'starter';

/** A unified Catalog entry. Lessons and starters share one list; the type
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
  /** Starters: the underlying block-based session.
   *  Lessons: the guided run (session.guided = true). */
  session?: PracticeSession;
}

const starterMeta = (s: PracticeSession): string => {
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

const STARTER_ITEMS: CatalogItem[] = STARTER_SESSIONS.map(s => ({
  id: `starter-${s.id}`,
  type: 'starter',
  title: s.name,
  meta: starterMeta(s),
  session: s,
}));

/** Lessons first (sequenced curriculum), then starters. */
export const CATALOG_ITEMS: CatalogItem[] = [...LESSON_ITEMS, ...STARTER_ITEMS];
