import { SubdivisionType, TimeSignature } from './MetronomeTypes';

/** Guided-run block kinds. Untyped blocks are classic exercise blocks
 *  (Workouts, My Sessions): tempo runs, timer shows overtime, user advances
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
  /** Composer stamp (spec #5): blocks sharing a componentId entered the
   *  session together as one picked component (a lesson section or a whole
   *  workout) and are grouped as one unit in the editor. Copies are frozen
   *  at composition time — later lesson tuning doesn't propagate. */
  componentId?: string;
  /** e.g. "Hand Sticking · Groove Is In The Heart" or "Rudiment Builder" */
  componentLabel?: string;
}

/** A named, coherent group of blocks within a lesson — the unit a human
 *  thinks in, and the pickable unit for the Session composer. Structural
 *  blocks (rests between sections, the closing Mission) belong to no
 *  section and are therefore never offered as components. */
export interface SessionSection {
  id: string;
  name: string;
  /** Ids into the owning session's blocks, in play order. */
  blockIds: string[];
}

export interface PracticeSession {
  id: string;
  name: string;
  blocks: SessionBlock[];
  createdAt: string;
  updatedAt: string;
  /** Catalog Workout: app-provided, not user data. Ids aren't UUIDs, so
   *  history logs null for them. */
  isWorkout?: boolean;
  /** Guided lesson run: CoachStage takes center stage, metronome demotes to
   *  the bottom runner bar. Lesson ids aren't UUIDs, so history logs null. */
  guided?: boolean;
  /** Lessons only: named pickable groupings over blocks (see SessionSection).
   *  Ignored by the runner and Coach Mode; read by the Session composer. */
  sections?: SessionSection[];
}

export interface SessionHistoryEntry {
  id: string;
  sessionId: string | null;
  sessionName: string;
  completedAt: string; // ISO string
  blocksCompleted: number;
  totalDurationMinutes: number;
}
