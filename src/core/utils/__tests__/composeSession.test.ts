import { GROOVE_IS_IN_THE_HEART } from '../../../features/Sessions/lessons/grooveIsInTheHeart';
import { SessionBlock } from '../../types/SessionTypes';
import {
  blocksSummary,
  copySectionBlocks,
  copyWorkoutBlocks,
  moveEntry,
  removeEntry,
  toEditorEntries,
} from '../composeSession';

const handBlock = (id: string): SessionBlock => ({ id, tempo: 100, durationMinutes: 5 });

describe('composition by copy', () => {
  const lesson = GROOVE_IS_IN_THE_HEART;
  const handSticking = lesson.sections!.find(s => s.id === 'hand-sticking')!;

  it('copies a section in order with fresh ids and one shared component stamp', () => {
    const copied = copySectionBlocks(lesson, handSticking);
    expect(copied.map(b => b.label)).toEqual(['Single Strokes', 'Around the Kit']);
    // Fresh ids — the lesson's own blocks are never referenced
    for (const b of copied) expect(lesson.blocks.some(l => l.id === b.id)).toBe(false);
    const stamps = new Set(copied.map(b => b.componentId));
    expect(stamps.size).toBe(1);
    expect(copied[0].componentLabel).toBe('Hand Sticking · Groove Is In The Heart');
  });

  it('copies preserve coach semantics (type, tempo, content) — frozen snapshot', () => {
    const copied = copySectionBlocks(lesson, handSticking);
    expect(copied[0].type).toBe('do');
    expect(copied[0].tempo).toBe(60);
    expect(copied[0].content?.eyebrow).toContain('hand sticking');
  });

  it('two copies of the same section are independent components', () => {
    const a = copySectionBlocks(lesson, handSticking);
    const b = copySectionBlocks(lesson, handSticking);
    expect(a[0].componentId).not.toBe(b[0].componentId);
    expect(a[0].id).not.toBe(b[0].id);
  });

  it('copies a workout whole as one component', () => {
    const workout: SessionBlock[] = copyWorkoutBlocks({
      id: 'w',
      name: 'Rudiment Builder',
      blocks: [handBlock('a'), handBlock('b')],
      createdAt: '',
      updatedAt: '',
    });
    expect(workout).toHaveLength(2);
    expect(workout[0].componentLabel).toBe('Rudiment Builder');
    expect(workout[0].componentId).toBe(workout[1].componentId);
  });

  it('structural blocks (rests, Mission outro) belong to no section — never pickable', () => {
    const sectionBlockIds = new Set(lesson.sections!.flatMap(s => s.blockIds));
    expect(sectionBlockIds.has('l1-break-1')).toBe(false);
    expect(sectionBlockIds.has('l1-break-2')).toBe(false);
    expect(sectionBlockIds.has('l1-mission')).toBe(false);
    // ...and every pickable id resolves to a real block
    Array.from(sectionBlockIds).forEach(id => {
      expect(lesson.blocks.some(b => b.id === id)).toBe(true);
    });
  });
});

describe('editor entries', () => {
  const lesson = GROOVE_IS_IN_THE_HEART;
  const section = copySectionBlocks(lesson, lesson.sections![2]); // 2 blocks
  const mixed = [handBlock('h1'), ...section, handBlock('h2')];

  it('groups consecutive component blocks into one entry, hand blocks stay single', () => {
    const entries = toEditorEntries(mixed);
    expect(entries.map(e => e.kind)).toEqual(['block', 'component', 'block']);
    expect(entries[1].kind === 'component' && entries[1].blocks).toHaveLength(2);
  });

  it('moving an entry moves the whole component and keeps it contiguous', () => {
    const entries = toEditorEntries(mixed);
    const moved = moveEntry(entries, 1, 1); // component below h2
    expect(moved.map(b => b.id)).toEqual(['h1', 'h2', section[0].id, section[1].id]);
    // Regrouping still yields one component entry
    expect(toEditorEntries(moved).map(e => e.kind)).toEqual(['block', 'block', 'component']);
  });

  it('out-of-range moves are no-ops', () => {
    const entries = toEditorEntries(mixed);
    expect(moveEntry(entries, 0, -1).map(b => b.id)).toEqual(mixed.map(b => b.id));
    expect(moveEntry(entries, 2, 1).map(b => b.id)).toEqual(mixed.map(b => b.id));
  });

  it('removing a component entry removes all its blocks', () => {
    const entries = toEditorEntries(mixed);
    expect(removeEntry(entries, 1).map(b => b.id)).toEqual(['h1', 'h2']);
  });

  it('pre-composer sessions (no stamps) group as plain blocks — fully editable as before', () => {
    const legacy = [handBlock('a'), handBlock('b')];
    expect(toEditorEntries(legacy).every(e => e.kind === 'block')).toBe(true);
  });
});

describe('blocksSummary', () => {
  it('summarizes count, minutes, and tempo range', () => {
    expect(blocksSummary([handBlock('a')])).toBe('1 block · 5 min · 100 BPM');
    expect(blocksSummary([handBlock('a'), { ...handBlock('b'), tempo: 60 }])).toBe(
      '2 blocks · 10 min · 60–100 BPM'
    );
    expect(blocksSummary([{ id: 'x', durationMinutes: 3 }])).toBe('1 block · 3 min · no click');
  });
});
