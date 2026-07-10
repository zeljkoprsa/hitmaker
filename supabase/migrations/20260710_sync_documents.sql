-- Roaming Queue + My Sessions: whole-document sync per user.
-- One row per (user, doc). Conflict resolution is last-write-wins on
-- updated_at at whole-document granularity (see spec: Roaming Queue +
-- My Sessions). doc_key 'queue' holds the ordered QueueItem[]; doc_key
-- 'sessions' holds the full PracticeSession[] set.

CREATE TABLE IF NOT EXISTS sync_documents (
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_key     TEXT        NOT NULL CHECK (doc_key IN ('queue', 'sessions')),
  data        JSONB       NOT NULL DEFAULT '[]',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, doc_key)
);

ALTER TABLE sync_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON sync_documents FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "insert_own" ON sync_documents FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "update_own" ON sync_documents FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "delete_own" ON sync_documents FOR DELETE USING ((SELECT auth.uid()) = user_id);
