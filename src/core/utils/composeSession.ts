import { PracticeSession, SessionBlock, SessionSection } from '../types/SessionTypes';

/**
 * Session composer primitives (spec #5). Composition is by COPY: picked
 * blocks are cloned with fresh ids and stamped with a shared componentId,
 * freezing the session at composition time. The session stays a flat block
 * list, so the existing runner and pre-composer sessions are untouched.
 */

const cloneWithStamp = (
  blocks: SessionBlock[],
  componentId: string,
  componentLabel: string
): SessionBlock[] =>
  blocks.map(b => ({
    ...b,
    id: crypto.randomUUID(),
    componentId,
    componentLabel,
  }));

/** Copy a lesson section's blocks, in section order, as one component. */
export const copySectionBlocks = (
  lesson: PracticeSession,
  section: SessionSection
): SessionBlock[] => {
  const byId = new Map(lesson.blocks.map(b => [b.id, b]));
  const blocks = section.blockIds
    .map(id => byId.get(id))
    .filter((b): b is SessionBlock => b !== undefined);
  return cloneWithStamp(blocks, crypto.randomUUID(), `${section.name} · ${lesson.name}`);
};

/** Copy a whole workout as one component. */
export const copyWorkoutBlocks = (workout: PracticeSession): SessionBlock[] =>
  cloneWithStamp(workout.blocks, crypto.randomUUID(), workout.name);

// --- Editor grouping -------------------------------------------------------

export type EditorEntry =
  /** Consecutive blocks sharing a componentId: one composed unit. */
  | { kind: 'component'; componentId: string; label: string; blocks: SessionBlock[] }
  /** A hand-built (or pre-composer) block, editable as before. */
  | { kind: 'block'; block: SessionBlock };

/** Group a flat block list into editor entries, preserving order. */
export const toEditorEntries = (blocks: SessionBlock[]): EditorEntry[] => {
  const entries: EditorEntry[] = [];
  for (const block of blocks) {
    const last = entries[entries.length - 1];
    if (block.componentId && last?.kind === 'component' && last.componentId === block.componentId) {
      last.blocks.push(block);
    } else if (block.componentId) {
      entries.push({
        kind: 'component',
        componentId: block.componentId,
        label: block.componentLabel ?? 'Component',
        blocks: [block],
      });
    } else {
      entries.push({ kind: 'block', block });
    }
  }
  return entries;
};

const entrySegments = (entries: EditorEntry[]): SessionBlock[][] =>
  entries.map(e => (e.kind === 'component' ? e.blocks : [e.block]));

/** Move an entry (component group or single block) one slot; returns the
 *  new flat block list. Out-of-range moves return the original order. */
export const moveEntry = (entries: EditorEntry[], index: number, dir: -1 | 1): SessionBlock[] => {
  const segments = entrySegments(entries);
  const target = index + dir;
  if (index < 0 || index >= segments.length || target < 0 || target >= segments.length) {
    return segments.flat();
  }
  [segments[index], segments[target]] = [segments[target], segments[index]];
  return segments.flat();
};

/** Remove an entry wholesale; returns the new flat block list. */
export const removeEntry = (entries: EditorEntry[], index: number): SessionBlock[] =>
  entrySegments(entries)
    .filter((_, i) => i !== index)
    .flat();

// --- Display ---------------------------------------------------------------

/** "2 blocks · 8 min · 60 BPM" / "4 blocks · 16 min · 60–120 BPM" /
 *  "1 block · 3 min · no click" — composing-time gist of a block group. */
export const blocksSummary = (blocks: SessionBlock[]): string => {
  const blockLabel = blocks.length === 1 ? '1 block' : `${blocks.length} blocks`;
  const minutes = blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const tempos = blocks.map(b => b.tempo).filter((t): t is number => t != null);
  const tempoLabel =
    tempos.length === 0
      ? 'no click'
      : Math.min(...tempos) === Math.max(...tempos)
        ? `${tempos[0]} BPM`
        : `${Math.min(...tempos)}–${Math.max(...tempos)} BPM`;
  return `${blockLabel} · ${minutes} min · ${tempoLabel}`;
};
