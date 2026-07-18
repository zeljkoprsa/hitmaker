import { SupabaseClient } from '@supabase/supabase-js';

import { Lesson } from '../core/types/LessonTypes';
import { SessionBlock, SessionSection } from '../core/types/SessionTypes';

/**
 * Supabase I/O for lessons (spec #7). Per-row like the journal: one row per
 * lesson keyed (user_id, id) — TEXT id, because the seeded lesson keeps its
 * slug id and every user seeds the same slug. `synced` is a local-only
 * outbox flag and never leaves the client.
 */

interface LessonRow {
  id: string;
  name: string;
  lesson_number: string | null;
  sections: SessionSection[];
  blocks: SessionBlock[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const rowToLesson = (r: LessonRow): Lesson => ({
  id: r.id,
  name: r.name,
  guided: true,
  lessonNumber: r.lesson_number ?? undefined,
  sections: Array.isArray(r.sections) ? r.sections : [],
  blocks: Array.isArray(r.blocks) ? r.blocks : [],
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deletedAt: r.deleted_at ?? undefined,
  synced: true,
});

const lessonToRow = (l: Lesson, userId: string) => ({
  id: l.id,
  user_id: userId,
  name: l.name,
  lesson_number: l.lessonNumber ?? null,
  guided: true,
  sections: l.sections ?? [],
  blocks: l.blocks,
  created_at: l.createdAt,
  updated_at: l.updatedAt,
  deleted_at: l.deletedAt ?? null,
});

export const fetchRemoteLessons = async (
  supabase: SupabaseClient,
  userId: string
): Promise<Lesson[]> => {
  const { data, error } = await supabase.from('lessons').select('*').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map(rowToLesson);
};

/** Upsert lessons by (user_id, id) — covers create, edit, and tombstone. */
export const pushLessons = async (
  supabase: SupabaseClient,
  userId: string,
  lessons: Lesson[]
): Promise<void> => {
  if (lessons.length === 0) return;
  const { error } = await supabase.from('lessons').upsert(
    lessons.map(l => lessonToRow(l, userId)),
    { onConflict: 'user_id,id' }
  );
  if (error) throw error;
};
