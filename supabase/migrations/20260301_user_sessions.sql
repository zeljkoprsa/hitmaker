CREATE TABLE IF NOT EXISTS user_sessions (
  id          UUID        PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  blocks      JSONB       NOT NULL DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON user_sessions FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "insert_own" ON user_sessions FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "update_own" ON user_sessions FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "delete_own" ON user_sessions FOR DELETE USING ((SELECT auth.uid()) = user_id);
