/** Practice Journal (spec #6): a retrospective log of what was actually
 *  practiced. Entries are append-heavy and stored per-row (see
 *  supabase/migrations/20260717_practice_journal.sql), not whole-document. */

export type RunType = 'session' | 'workout' | 'lesson';
export type RunStatus = 'completed' | 'abandoned';

/** One section / component that ran, with the tempo(s) it drove the
 *  metronome to. Silent blocks (no tempo) contribute no tempos. */
export interface JournalComponent {
  label: string;
  tempos: number[];
}

export interface JournalEntry {
  id: string;
  runType: RunType;
  /** Originating session id (UUID). Null for workouts/lessons — their ids
   *  aren't UUIDs, and the entry is a frozen record regardless. */
  sourceId: string | null;
  name: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  durationMinutes: number;
  status: RunStatus;
  blocksTotal: number;
  blocksCompleted: number;
  /** Sections/components covered (up to the abandon point), auto-derived. */
  components: JournalComponent[];
  /** Optional free-text reflection, added/edited after the run. */
  reflection?: string;
  /** Bumped on reflection edit; drives per-entry convergence on sync. */
  updatedAt: string; // ISO
  /** Local outbox flag — true once the row is confirmed in Supabase. Never
   *  sent to the cloud; absent/false means "needs push". */
  synced?: boolean;
}
