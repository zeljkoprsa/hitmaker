import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Whole-document sync for roaming user data (Queue, My Sessions).
 *
 * Each doc is an array persisted locally as an envelope { data, updatedAt,
 * dirty } and remotely as one row in `sync_documents` keyed by
 * (user_id, doc_key). Conflicts resolve last-write-wins on updated_at at
 * whole-document granularity — the more recently updated side overwrites
 * the other. Offline changes stay dirty locally and push on reconnect.
 */

export type DocKey = 'queue' | 'sessions';

export interface LocalDoc<T> {
  data: T[];
  /** ISO timestamp of the last local change; null for data that predates
   *  sync (legacy raw-array localStorage) and has never been stamped. */
  updatedAt: string | null;
  /** True when a local change hasn't been confirmed pushed to Supabase. */
  dirty: boolean;
}

export interface RemoteDoc<T> {
  data: T[];
  updatedAt: string;
}

// --- Local persistence ---------------------------------------------------
// The envelope lives in the same localStorage key that used to hold the raw
// array, so pre-sync data is picked up in place (a bare array parses as a
// legacy doc with no timestamp).

export const loadLocalDoc = <T>(storageKey: string): LocalDoc<T> => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return { data: [], updatedAt: null, dirty: false };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { data: parsed as T[], updatedAt: null, dirty: false };
    return {
      data: Array.isArray(parsed.data) ? (parsed.data as T[]) : [],
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      dirty: Boolean(parsed.dirty),
    };
  } catch {
    return { data: [], updatedAt: null, dirty: false };
  }
};

export const saveLocalDoc = <T>(storageKey: string, doc: LocalDoc<T>): void => {
  localStorage.setItem(storageKey, JSON.stringify(doc));
};

// --- Conflict resolution (pure, unit-tested) ------------------------------

export type ReconcileAction<T> =
  | { kind: 'none' }
  /** Local side wins (or remote row missing): upsert local to Supabase. */
  | { kind: 'push' }
  /** Remote side wins: overwrite local state and storage. */
  | { kind: 'apply-remote'; data: T[]; updatedAt: string }
  /** First sync of a device with pre-sync local data: adopt merged set
   *  locally and push it. Only used when a merge function is provided. */
  | { kind: 'merge'; data: T[] };

export const reconcile = <T>(
  local: LocalDoc<T>,
  remote: RemoteDoc<T> | null,
  mergeFirstSync?: (local: T[], remote: T[]) => T[]
): ReconcileAction<T> => {
  if (!remote) {
    // Nothing in the cloud yet: seed it from local if there's anything to seed.
    return local.data.length > 0 || local.dirty ? { kind: 'push' } : { kind: 'none' };
  }

  if (local.updatedAt === null) {
    // This device never synced. Legacy local data has no timestamp to
    // compare, so plain LWW can't apply.
    if (local.data.length === 0) {
      return { kind: 'apply-remote', data: remote.data, updatedAt: remote.updatedAt };
    }
    if (mergeFirstSync) return { kind: 'merge', data: mergeFirstSync(local.data, remote.data) };
    // No merge strategy (Queue): prefer the remote doc unless it's empty,
    // so a never-synced local queue isn't wiped by an empty cloud row.
    return remote.data.length > 0
      ? { kind: 'apply-remote', data: remote.data, updatedAt: remote.updatedAt }
      : { kind: 'push' };
  }

  const localTime = new Date(local.updatedAt).getTime();
  const remoteTime = new Date(remote.updatedAt).getTime();
  if (remoteTime > localTime) {
    return { kind: 'apply-remote', data: remote.data, updatedAt: remote.updatedAt };
  }
  if (localTime > remoteTime || local.dirty) return { kind: 'push' };
  return { kind: 'none' };
};

// --- Supabase I/O ----------------------------------------------------------

export const fetchRemoteDoc = async <T>(
  supabase: SupabaseClient,
  userId: string,
  docKey: DocKey
): Promise<RemoteDoc<T> | null> => {
  const { data, error } = await supabase
    .from('sync_documents')
    .select('data, updated_at')
    .eq('user_id', userId)
    .eq('doc_key', docKey)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { data: (data.data ?? []) as T[], updatedAt: data.updated_at as string };
};

export const pushRemoteDoc = async <T>(
  supabase: SupabaseClient,
  userId: string,
  docKey: DocKey,
  doc: { data: T[]; updatedAt: string }
): Promise<void> => {
  const { error } = await supabase.from('sync_documents').upsert(
    {
      user_id: userId,
      doc_key: docKey,
      data: doc.data,
      updated_at: doc.updatedAt,
    },
    { onConflict: 'user_id,doc_key' }
  );
  if (error) throw error;
};
