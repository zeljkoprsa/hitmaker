import { SupabaseClient } from '@supabase/supabase-js';

import { JournalComponent, JournalEntry, RunStatus, RunType } from '../core/types/JournalTypes';

/**
 * Supabase I/O for the practice journal (spec #6). Per-row, not whole-doc:
 * each run is its own row, so devices never contend. `synced` is a local-only
 * outbox flag and never leaves the client.
 */

interface JournalRow {
  id: string;
  run_type: string;
  source_id: string | null;
  name: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number | string;
  status: string;
  blocks_total: number;
  blocks_completed: number;
  components: JournalComponent[];
  reflection: string | null;
  updated_at: string;
}

const rowToEntry = (r: JournalRow): JournalEntry => ({
  id: r.id,
  runType: r.run_type as RunType,
  sourceId: r.source_id,
  name: r.name,
  startedAt: r.started_at,
  endedAt: r.ended_at,
  durationMinutes: Number(r.duration_minutes),
  status: r.status as RunStatus,
  blocksTotal: r.blocks_total,
  blocksCompleted: r.blocks_completed,
  components: Array.isArray(r.components) ? r.components : [],
  reflection: r.reflection ?? undefined,
  updatedAt: r.updated_at,
  synced: true,
});

const entryToRow = (e: JournalEntry, userId: string) => ({
  id: e.id,
  user_id: userId,
  run_type: e.runType,
  source_id: e.sourceId,
  name: e.name,
  started_at: e.startedAt,
  ended_at: e.endedAt,
  duration_minutes: e.durationMinutes,
  status: e.status,
  blocks_total: e.blocksTotal,
  blocks_completed: e.blocksCompleted,
  components: e.components,
  reflection: e.reflection ?? null,
  updated_at: e.updatedAt,
});

export const fetchRemoteEntries = async (
  supabase: SupabaseClient,
  userId: string
): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('practice_journal')
    .select('*')
    .eq('user_id', userId)
    .order('ended_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToEntry);
};

/** Upsert entries by id (covers both first insert and reflection edits). */
export const pushEntries = async (
  supabase: SupabaseClient,
  userId: string,
  entries: JournalEntry[]
): Promise<void> => {
  if (entries.length === 0) return;
  const { error } = await supabase.from('practice_journal').upsert(
    entries.map(e => entryToRow(e, userId)),
    { onConflict: 'id' }
  );
  if (error) throw error;
};
