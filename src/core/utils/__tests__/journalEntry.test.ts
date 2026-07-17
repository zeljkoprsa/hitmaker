import { JournalEntry } from '../../types/JournalTypes';
import { PracticeSession, SessionBlock } from '../../types/SessionTypes';
import { buildJournalEntry, mergeEntries, summarizeComponents } from '../journalEntry';

const block = (over: Partial<SessionBlock>): SessionBlock => ({
  id: over.id ?? Math.random().toString(),
  durationMinutes: 4,
  ...over,
});

describe('summarizeComponents', () => {
  it('collapses consecutive blocks sharing a componentId into one component', () => {
    const blocks = [
      block({ componentId: 'c1', componentLabel: 'Hand Sticking · Groove', tempo: 60 }),
      block({ componentId: 'c1', componentLabel: 'Hand Sticking · Groove', tempo: 60 }),
    ];
    expect(summarizeComponents(blocks)).toEqual([
      { label: 'Hand Sticking · Groove', tempos: [60] },
    ]);
  });

  it('keeps standalone blocks separate under their own labels', () => {
    const blocks = [
      block({ label: 'Slow warmup', tempo: 60 }),
      block({ label: 'Push', tempo: 100 }),
    ];
    expect(summarizeComponents(blocks)).toEqual([
      { label: 'Slow warmup', tempos: [60] },
      { label: 'Push', tempos: [100] },
    ]);
  });

  it('collects distinct tempos in order and omits silent (no-tempo) blocks', () => {
    const blocks = [
      block({ componentId: 'c', componentLabel: 'Ramp', tempo: 60 }),
      block({ componentId: 'c', componentLabel: 'Ramp', tempo: 80 }),
      block({ componentId: 'c', componentLabel: 'Ramp', tempo: 60 }), // dup dropped
    ];
    expect(summarizeComponents(blocks)).toEqual([{ label: 'Ramp', tempos: [60, 80] }]);

    const silent = [block({ label: 'Stretching' })]; // no tempo
    expect(summarizeComponents(silent)).toEqual([{ label: 'Stretching', tempos: [] }]);
  });
});

describe('buildJournalEntry', () => {
  const session = (over: Partial<PracticeSession>): PracticeSession => ({
    id: 'sess-1',
    name: 'Test',
    blocks: [],
    createdAt: '',
    updatedAt: '',
    ...over,
  });
  const T0 = '2026-07-17T10:00:00.000Z';
  const T10 = '2026-07-17T10:10:00.000Z';

  it('derives run type and source id: sessions carry a source, workouts/lessons null', () => {
    const blocks = [block({ label: 'A', tempo: 60 })];
    const s = buildJournalEntry({
      session: session({ blocks }),
      startedAt: T0,
      endedAt: T10,
      status: 'completed',
      ranBlocks: blocks,
      newId: () => 'id-1',
    });
    expect(s.runType).toBe('session');
    expect(s.sourceId).toBe('sess-1');

    const workout = buildJournalEntry({
      session: session({ isWorkout: true, blocks }),
      startedAt: T0,
      endedAt: T10,
      status: 'completed',
      ranBlocks: blocks,
    });
    expect(workout.runType).toBe('workout');
    expect(workout.sourceId).toBeNull();

    const lesson = buildJournalEntry({
      session: session({ guided: true, blocks }),
      startedAt: T0,
      endedAt: T10,
      status: 'completed',
      ranBlocks: blocks,
    });
    expect(lesson.runType).toBe('lesson');
    expect(lesson.sourceId).toBeNull();
  });

  it('records real elapsed duration and completed-block count for a full run', () => {
    const blocks = [block({ tempo: 60 }), block({ tempo: 80 }), block({ tempo: 100 })];
    const entry = buildJournalEntry({
      session: session({ blocks }),
      startedAt: T0,
      endedAt: T10,
      status: 'completed',
      ranBlocks: blocks,
    });
    expect(entry.durationMinutes).toBe(10);
    expect(entry.blocksTotal).toBe(3);
    expect(entry.blocksCompleted).toBe(3);
    expect(entry.status).toBe('completed');
  });

  it('marks an abandoned run and counts only fully-finished blocks', () => {
    const blocks = [block({ tempo: 60 }), block({ tempo: 80 }), block({ tempo: 100 })];
    // Bailed during block index 1 → ran blocks [0,1], one fully completed.
    const entry = buildJournalEntry({
      session: session({ blocks }),
      startedAt: T0,
      endedAt: '2026-07-17T10:03:30.000Z',
      status: 'abandoned',
      ranBlocks: blocks.slice(0, 2),
    });
    expect(entry.status).toBe('abandoned');
    expect(entry.blocksTotal).toBe(3);
    expect(entry.blocksCompleted).toBe(1);
    expect(entry.durationMinutes).toBe(3.5);
  });
});

describe('mergeEntries (per-entry union)', () => {
  const entry = (id: string, updatedAt: string, reflection?: string): JournalEntry => ({
    id,
    runType: 'session',
    sourceId: null,
    name: id,
    startedAt: updatedAt,
    endedAt: updatedAt,
    durationMinutes: 5,
    status: 'completed',
    blocksTotal: 1,
    blocksCompleted: 1,
    components: [],
    reflection,
    updatedAt,
  });
  const T1 = '2026-07-17T10:00:00.000Z';
  const T2 = '2026-07-17T11:00:00.000Z';

  it('unions disjoint entries from both devices', () => {
    const merged = mergeEntries([entry('local', T1)], [entry('remote', T1)]);
    expect(merged.map(e => e.id).sort()).toEqual(['local', 'remote']);
  });

  it('keeps the newer copy on id collision (converges a reflection edit)', () => {
    const merged = mergeEntries([entry('x', T2, 'edited note')], [entry('x', T1, undefined)]);
    expect(merged).toHaveLength(1);
    expect(merged[0].reflection).toBe('edited note');

    const merged2 = mergeEntries([entry('x', T1)], [entry('x', T2, 'remote note')]);
    expect(merged2[0].reflection).toBe('remote note');
  });
});
