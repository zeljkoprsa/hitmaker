CREATE TABLE IF NOT EXISTS session_history (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id             UUID,                   -- NULL ok (starters, Tempo Trainer)
  session_name           TEXT        NOT NULL,
  completed_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocks_completed       INT         NOT NULL,
  total_duration_minutes NUMERIC     NOT NULL
);

ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON session_history FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "insert_own" ON session_history FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "delete_own" ON session_history FOR DELETE USING ((SELECT auth.uid()) = user_id);
