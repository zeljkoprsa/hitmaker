-- Post-promotion cleanup for the roaming sync feature: My Sessions now sync
-- as a whole document in sync_documents (see 20260710_sync_documents.sql),
-- so the per-row user_sessions table is unused. Any rows written by the
-- pre-sync build are folded into the user's sessions doc first (skipped if
-- the user already has one — the doc is then the newer source of truth).
-- Stale clients running the pre-sync build fail their user_sessions writes
-- silently and keep working from localStorage until they update.
--
-- session_history is unrelated and stays.

INSERT INTO sync_documents (user_id, doc_key, data, updated_at)
SELECT
  user_id,
  'sessions',
  jsonb_agg(
    jsonb_build_object(
      'id', id,
      'name', name,
      'blocks', blocks,
      'createdAt', created_at,
      'updatedAt', updated_at
    )
  ),
  max(updated_at)
FROM user_sessions
GROUP BY user_id
ON CONFLICT (user_id, doc_key) DO NOTHING;

DROP TABLE IF EXISTS user_sessions;
