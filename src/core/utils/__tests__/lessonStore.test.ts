import { Lesson } from '../../types/LessonTypes';
import {
  liveLessons,
  mergeLessons,
  SEED_STAMP,
  SEEDED_LESSON_ID,
  seededLesson,
  withSeed,
} from '../lessonStore';

const lesson = (id: string, updatedAt: string, extra: Partial<Lesson> = {}): Lesson => ({
  id,
  name: `Lesson ${id}`,
  guided: true,
  blocks: [],
  sections: [],
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt,
  ...extra,
});

describe('mergeLessons', () => {
  it('unions by id — nothing from either side is lost', () => {
    const local = [lesson('a', '2026-07-02T00:00:00.000Z')];
    const remote = [lesson('b', '2026-07-03T00:00:00.000Z')];
    const merged = mergeLessons(local, remote);
    expect(merged.map(l => l.id).sort()).toEqual(['a', 'b']);
  });

  it('newer updatedAt wins per row', () => {
    const local = [lesson('a', '2026-07-05T00:00:00.000Z', { name: 'newer' })];
    const remote = [lesson('a', '2026-07-02T00:00:00.000Z', { name: 'older' })];
    expect(mergeLessons(local, remote)[0].name).toBe('newer');
    expect(mergeLessons(remote, local)[0].name).toBe('newer');
  });

  it('local wins ties (unsynced edits are not clobbered by their own echo)', () => {
    const stamp = '2026-07-05T00:00:00.000Z';
    const local = [lesson('a', stamp, { name: 'local', synced: false })];
    const remote = [lesson('a', stamp, { name: 'remote', synced: true })];
    expect(mergeLessons(local, remote)[0].name).toBe('local');
  });

  it('a newer tombstone beats an older edit', () => {
    const local = [lesson('a', '2026-07-02T00:00:00.000Z', { name: 'edited' })];
    const remote = [
      lesson('a', '2026-07-06T00:00:00.000Z', { deletedAt: '2026-07-06T00:00:00.000Z' }),
    ];
    expect(mergeLessons(local, remote)[0].deletedAt).toBeDefined();
  });

  it('a newer edit beats an older tombstone', () => {
    const local = [lesson('a', '2026-07-08T00:00:00.000Z', { name: 'revived' })];
    const remote = [
      lesson('a', '2026-07-06T00:00:00.000Z', { deletedAt: '2026-07-06T00:00:00.000Z' }),
    ];
    const winner = mergeLessons(local, remote)[0];
    expect(winner.deletedAt).toBeUndefined();
    expect(winner.name).toBe('revived');
  });
});

describe('withSeed', () => {
  it('seeds the built-in lesson into an empty store', () => {
    const seeded = withSeed([]);
    expect(seeded).toHaveLength(1);
    expect(seeded[0].id).toBe(SEEDED_LESSON_ID);
    expect(seeded[0].blocks.length).toBeGreaterThan(0);
    expect(seeded[0].sections?.length).toBeGreaterThan(0);
  });

  it('is idempotent — a present seed is not duplicated or reset', () => {
    const edited = { ...seededLesson(), name: 'Tuned', updatedAt: '2026-08-01T00:00:00.000Z' };
    const result = withSeed([edited]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Tuned');
  });

  it('does not resurrect a tombstoned seed', () => {
    const deleted = {
      ...seededLesson(),
      deletedAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
    };
    const result = withSeed([deleted]);
    expect(result).toHaveLength(1);
    expect(result[0].deletedAt).toBeDefined();
  });

  it('seed stamp loses merges against any real user action', () => {
    // A fresh device seeds; the cloud holds a tombstoned (or edited) seed.
    const freshSeed = seededLesson();
    const cloudTombstone = {
      ...seededLesson(),
      deletedAt: '2026-08-01T00:00:00.000Z',
      updatedAt: '2026-08-01T00:00:00.000Z',
      synced: true,
    };
    expect(new Date(freshSeed.updatedAt).getTime()).toBe(new Date(SEED_STAMP).getTime());
    const merged = mergeLessons([freshSeed], [cloudTombstone]);
    expect(merged).toHaveLength(1);
    expect(merged[0].deletedAt).toBeDefined();
  });
});

describe('liveLessons', () => {
  it('filters tombstones and orders by lessonNumber, numberless last', () => {
    const lessons = [
      lesson('c', '2026-07-01T00:00:00.000Z', { name: 'Numberless' }),
      lesson('b', '2026-07-01T00:00:00.000Z', { lessonNumber: '02' }),
      lesson('a', '2026-07-01T00:00:00.000Z', { lessonNumber: '01' }),
      lesson('d', '2026-07-01T00:00:00.000Z', {
        deletedAt: '2026-07-02T00:00:00.000Z',
        lessonNumber: '00',
      }),
    ];
    expect(liveLessons(lessons).map(l => l.id)).toEqual(['a', 'b', 'c']);
  });
});
