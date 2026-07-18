import { GROOVE_IS_IN_THE_HEART } from '../../features/Sessions/lessons/grooveIsInTheHeart';
import { Lesson } from '../types/LessonTypes';

/**
 * Pure helpers for the lessons store (spec #7): per-row merge and the
 * idempotent seed. Kept free of React/storage so they unit-test like
 * journal's mergeEntries.
 */

/** Union by id; newer updatedAt wins, local wins ties (mirrors the journal's
 *  mergeEntries). Tombstones are ordinary rows here: a newer deletion beats
 *  an older edit and a newer edit beats an older deletion. */
export const mergeLessons = (local: Lesson[], remote: Lesson[]): Lesson[] => {
  const byId = new Map<string, Lesson>();
  for (const l of [...remote, ...local]) {
    const existing = byId.get(l.id);
    if (!existing || new Date(l.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
      byId.set(l.id, l);
    }
  }
  return Array.from(byId.values());
};

/** Fixed stamp for the seeded lesson. Deliberately in the past and identical
 *  on every device: any real edit or deletion carries a later updatedAt, so
 *  the seed can never win a merge against user intent (in particular, a
 *  fresh device's seed cannot resurrect a tombstoned seed from the cloud). */
export const SEED_STAMP = '2026-07-18T00:00:00.000Z';

export const SEEDED_LESSON_ID = GROOVE_IS_IN_THE_HEART.id;

export const seededLesson = (): Lesson => ({
  ...GROOVE_IS_IN_THE_HEART,
  guided: true,
  lessonNumber: '01',
  createdAt: SEED_STAMP,
  updatedAt: SEED_STAMP,
  synced: false,
});

/** Seed the built-in lesson iff its id is absent entirely — a live row keeps
 *  its edits, a tombstoned row stays deleted. Idempotent across launches. */
export const withSeed = (lessons: Lesson[]): Lesson[] =>
  lessons.some(l => l.id === SEEDED_LESSON_ID) ? lessons : [seededLesson(), ...lessons];

/** Live (non-tombstoned) lessons in display order: by lessonNumber, then
 *  name; numberless lessons after numbered ones. */
export const liveLessons = (lessons: Lesson[]): Lesson[] =>
  lessons
    .filter(l => !l.deletedAt)
    .sort((a, b) => {
      if (a.lessonNumber && b.lessonNumber) return a.lessonNumber.localeCompare(b.lessonNumber);
      if (a.lessonNumber) return -1;
      if (b.lessonNumber) return 1;
      return a.name.localeCompare(b.name);
    });
