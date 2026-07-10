import { SubdivisionType, TimeSignature } from './MetronomeTypes';

/** Guided-run block kinds. Untyped blocks are classic exercise blocks
 *  (Starters, My Sessions): tempo runs, timer shows overtime, user advances
 *  manually. Typed blocks (lessons) add coach semantics:
 *  - teach: content center stage, no countdown, advances on user action
 *  - do:    exercise at a tempo for a duration, auto-advances at 0
 *  - break: explicit rest with countdown, metronome silent, auto-advances */
export type SessionBlockType = 'teach' | 'do' | 'break';

/** Center-stage content for guided blocks. */
export interface BlockContent {
  /** Small uppercase tag, e.g. "warm-up", "technique", "no rules" */
  eyebrow?: string;
  /** Bullet rows; note renders dimmed after the text */
  items?: Array<{ text: string; note?: string }>;
  /** Freeform paragraph under the items */
  prose?: string;
}

export interface SessionBlock {
  id: string;
  label?: string;
  type?: SessionBlockType;
  /** Absent = the metronome stays silent for this block (teach/break/free play) */
  tempo?: number;
  /** Absent = keep whatever the metronome is already set to */
  timeSignature?: TimeSignature;
  subdivision?: SubdivisionType;
  durationMinutes: number;
  content?: BlockContent;
}

export interface PracticeSession {
  id: string;
  name: string;
  blocks: SessionBlock[];
  createdAt: string;
  updatedAt: string;
  isStarter?: boolean;
  /** Guided lesson run: CoachStage takes center stage, metronome demotes to
   *  the bottom runner bar. Lesson ids aren't UUIDs, so history logs null. */
  guided?: boolean;
}

export interface SessionHistoryEntry {
  id: string;
  sessionId: string | null;
  sessionName: string;
  completedAt: string; // ISO string
  blocksCompleted: number;
  totalDurationMinutes: number;
}
