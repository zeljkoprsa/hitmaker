import { SupabaseClient } from '@supabase/supabase-js';

import { IntakeItem, IntakeSource, IntakeStatus } from '../core/types/IntakeTypes';

/**
 * Supabase I/O for the intake inbox (spec #9). Per-row like lessons: one row
 * per captured item keyed (user_id, id). `synced` is a local-only outbox
 * flag and never leaves the client.
 */

interface IntakeRow {
  id: string;
  url: string;
  source: string;
  title: string | null;
  note: string | null;
  thumbnail_url: string | null;
  status: string;
  lesson_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const rowToItem = (r: IntakeRow): IntakeItem => ({
  id: r.id,
  url: r.url,
  source: r.source as IntakeSource,
  title: r.title ?? undefined,
  note: r.note ?? undefined,
  thumbnailUrl: r.thumbnail_url ?? undefined,
  status: r.status as IntakeStatus,
  lessonId: r.lesson_id ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deletedAt: r.deleted_at ?? undefined,
  synced: true,
});

const itemToRow = (i: IntakeItem, userId: string) => ({
  id: i.id,
  user_id: userId,
  url: i.url,
  source: i.source,
  title: i.title ?? null,
  note: i.note ?? null,
  thumbnail_url: i.thumbnailUrl ?? null,
  status: i.status,
  lesson_id: i.lessonId ?? null,
  created_at: i.createdAt,
  updated_at: i.updatedAt,
  deleted_at: i.deletedAt ?? null,
});

export const fetchRemoteItems = async (
  supabase: SupabaseClient,
  userId: string
): Promise<IntakeItem[]> => {
  const { data, error } = await supabase.from('intake_items').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map(rowToItem);
};

/** Upsert by (user_id, id) — covers capture, edits, status moves, tombstones. */
export const pushItems = async (
  supabase: SupabaseClient,
  userId: string,
  items: IntakeItem[]
): Promise<void> => {
  if (items.length === 0) return;
  const { error } = await supabase.from('intake_items').upsert(
    items.map(i => itemToRow(i, userId)),
    { onConflict: 'user_id,id' }
  );
  if (error) throw error;
};
