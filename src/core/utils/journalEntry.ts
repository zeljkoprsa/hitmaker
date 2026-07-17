import { JournalComponent, JournalEntry, RunStatus } from '../types/JournalTypes';
import { PracticeSession, SessionBlock } from '../types/SessionTypes';

/**
 * Automatic derivation of a journal entry from a run (spec #6). The app
 * captures what it already knows — sections/components covered, tempos that
 * ran, duration, completion — so the user is never asked to type a receipt.
 * All functions here are pure and unit-tested.
 */

/** Group the blocks that ran into the human-meaningful units a person thinks
 *  in: consecutive blocks sharing a componentId (a composed lesson section or
 *  whole workout, from spec #5) collapse into one; every other block stands
 *  alone under its own label. Tempos are the distinct values that actually
 *  drove the metronome, in order (silent blocks contribute none). */
export const summarizeComponents = (blocks: SessionBlock[]): JournalComponent[] => {
  const groups: Array<{ key: string; label: string; blocks: SessionBlock[] }> = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (block.componentId && last?.key === block.componentId) {
      last.blocks.push(block);
    } else if (block.componentId) {
      groups.push({
        key: block.componentId,
        label: block.componentLabel ?? block.label ?? 'Component',
        blocks: [block],
      });
    } else {
      // Each standalone block is its own component (lesson sections, hand
      // blocks); a unique key keeps adjacent same-label blocks separate.
      groups.push({
        key: `block-${groups.length}`,
        label: block.label ?? 'Block',
        blocks: [block],
      });
    }
  }

  return groups.map(g => {
    const tempos: number[] = [];
    for (const b of g.blocks) {
      if (b.tempo != null && !tempos.includes(b.tempo)) tempos.push(b.tempo);
    }
    return { label: g.label, tempos };
  });
};

const diffMinutes = (startedAt: string, endedAt: string): number => {
  const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  return Math.max(0, Math.round((ms / 60_000) * 10) / 10); // 1-decimal minutes
};

interface BuildParams {
  session: PracticeSession;
  startedAt: string;
  endedAt: string;
  status: RunStatus;
  /** Blocks that actually ran: all blocks for a completed run; blocks[0..i]
   *  (inclusive of the one bailed on) for an abandoned run. */
  ranBlocks: SessionBlock[];
  newId?: () => string;
}

/** Assemble a full entry from a finished run. Duration is real wall-clock
 *  elapsed (not the prescribed sum), so an abandoned run reads honestly. */
export const buildJournalEntry = ({
  session,
  startedAt,
  endedAt,
  status,
  ranBlocks,
  newId = () => crypto.randomUUID(),
}: BuildParams): JournalEntry => {
  const runType = session.guided ? 'lesson' : session.isWorkout ? 'workout' : 'session';
  return {
    id: newId(),
    runType,
    // Only real Sessions have UUID ids; workouts/lessons log a null source.
    sourceId: runType === 'session' ? session.id : null,
    name: session.name,
    startedAt,
    endedAt,
    durationMinutes: diffMinutes(startedAt, endedAt),
    status,
    blocksTotal: session.blocks.length,
    blocksCompleted: status === 'completed' ? ranBlocks.length : Math.max(0, ranBlocks.length - 1),
    components: summarizeComponents(ranBlocks),
    updatedAt: endedAt,
  };
};

/** Union two entry sets by id — newer updatedAt wins (converges reflection
 *  edits). Local and remote each hold entries the other may lack; ids are
 *  minted per run so there is no true contention beyond a re-edited note. */
export const mergeEntries = (local: JournalEntry[], remote: JournalEntry[]): JournalEntry[] => {
  const byId = new Map<string, JournalEntry>();
  for (const e of [...remote, ...local]) {
    const existing = byId.get(e.id);
    if (!existing || new Date(e.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
      byId.set(e.id, e);
    }
  }
  return Array.from(byId.values());
};
