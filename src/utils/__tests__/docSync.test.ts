import { PracticeSession } from '../../core/types/SessionTypes';
import { LocalDoc, loadLocalDoc, reconcile, saveLocalDoc } from '../docSync';
import { mergeSessionSets } from '../sessionMerge';

const T1 = '2026-07-10T10:00:00.000Z';
const T2 = '2026-07-10T11:00:00.000Z';
const T3 = '2026-07-10T12:00:00.000Z';

const local = (data: string[], updatedAt: string | null, dirty = false): LocalDoc<string> => ({
  data,
  updatedAt,
  dirty,
});

describe('reconcile (whole-document last-write-wins)', () => {
  it('does nothing when both sides are absent/empty', () => {
    expect(reconcile(local([], null), null)).toEqual({ kind: 'none' });
  });

  it('seeds the cloud from local when no remote row exists', () => {
    expect(reconcile(local(['a'], T1), null)).toEqual({ kind: 'push' });
    expect(reconcile(local(['a'], null), null)).toEqual({ kind: 'push' });
  });

  it('pushes when local is empty but has a dirty deletion', () => {
    // Emptying the doc is itself a change: an empty-but-dirty local must
    // overwrite the missing/newer-less remote, not be ignored.
    expect(reconcile(local([], T1, true), null)).toEqual({ kind: 'push' });
  });

  it('remote wins when remote is newer', () => {
    expect(reconcile(local(['a'], T1), { data: ['b'], updatedAt: T2 })).toEqual({
      kind: 'apply-remote',
      data: ['b'],
      updatedAt: T2,
    });
  });

  it('remote wins when remote is newer even if local is dirty (LWW)', () => {
    expect(reconcile(local(['a'], T1, true), { data: ['b'], updatedAt: T3 })).toEqual({
      kind: 'apply-remote',
      data: ['b'],
      updatedAt: T3,
    });
  });

  it('local wins when local is newer', () => {
    expect(reconcile(local(['a'], T3, true), { data: ['b'], updatedAt: T2 })).toEqual({
      kind: 'push',
    });
  });

  it('pushes unconfirmed local changes when timestamps tie', () => {
    expect(reconcile(local(['a'], T2, true), { data: ['b'], updatedAt: T2 })).toEqual({
      kind: 'push',
    });
    expect(reconcile(local(['a'], T2, false), { data: ['a'], updatedAt: T2 })).toEqual({
      kind: 'none',
    });
  });

  describe('first sync of a device with pre-sync (untimestamped) local data', () => {
    it('adopts remote when local is empty', () => {
      expect(reconcile(local([], null), { data: ['b'], updatedAt: T1 })).toEqual({
        kind: 'apply-remote',
        data: ['b'],
        updatedAt: T1,
      });
    });

    it('merges when a merge strategy is provided (sessions)', () => {
      const merge = (l: string[], r: string[]) => [...r, ...l];
      expect(reconcile(local(['a'], null), { data: ['b'], updatedAt: T1 }, merge)).toEqual({
        kind: 'merge',
        data: ['b', 'a'],
      });
    });

    it('without a merge strategy prefers a non-empty remote', () => {
      expect(reconcile(local(['a'], null), { data: ['b'], updatedAt: T1 })).toEqual({
        kind: 'apply-remote',
        data: ['b'],
        updatedAt: T1,
      });
    });

    it('without a merge strategy keeps local when remote is empty', () => {
      expect(reconcile(local(['a'], null), { data: [], updatedAt: T1 })).toEqual({ kind: 'push' });
    });
  });
});

describe('local doc persistence', () => {
  beforeEach(() => localStorage.clear());

  it('reads a legacy raw array as an untimestamped doc', () => {
    localStorage.setItem('k', JSON.stringify(['a', 'b']));
    expect(loadLocalDoc<string>('k')).toEqual({ data: ['a', 'b'], updatedAt: null, dirty: false });
  });

  it('round-trips the envelope', () => {
    saveLocalDoc('k', { data: ['a'], updatedAt: T1, dirty: true });
    expect(loadLocalDoc<string>('k')).toEqual({ data: ['a'], updatedAt: T1, dirty: true });
  });

  it('returns an empty doc for missing or corrupt values', () => {
    expect(loadLocalDoc<string>('missing')).toEqual({ data: [], updatedAt: null, dirty: false });
    localStorage.setItem('k', 'not json');
    expect(loadLocalDoc<string>('k')).toEqual({ data: [], updatedAt: null, dirty: false });
  });
});

describe('mergeSessionSets (one-time first-sync union)', () => {
  const session = (id: string, updatedAt: string, name = id): PracticeSession => ({
    id,
    name,
    blocks: [],
    createdAt: T1,
    updatedAt,
  });

  it('unions disjoint sets', () => {
    const merged = mergeSessionSets([session('l', T1)], [session('r', T2)]);
    expect(merged.map(s => s.id).sort()).toEqual(['l', 'r']);
  });

  it('keeps the newer copy on id collision', () => {
    const merged = mergeSessionSets(
      [session('x', T3, 'local-newer')],
      [session('x', T1, 'remote-older')]
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].name).toBe('local-newer');

    const merged2 = mergeSessionSets(
      [session('x', T1, 'local-older')],
      [session('x', T3, 'remote-newer')]
    );
    expect(merged2).toHaveLength(1);
    expect(merged2[0].name).toBe('remote-newer');
  });
});
