-- Spec #7: Lessons as data. Per-row like practice_journal — one row per
-- lesson, so devices never contend across lessons. The id is TEXT, not UUID:
-- the seeded lesson keeps its historical slug id and every user seeds the
-- same slug, hence the composite (user_id, id) primary key.
--
-- deleted_at is a soft-delete tombstone that syncs, so a deletion on one
-- device cannot be resurrected by another device's union-merge (deliberately
-- NOT the accepted sessions tradeoff from JAK-57 — curriculum is curated).

CREATE TABLE IF NOT EXISTS lessons (
  id            TEXT        NOT NULL,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  lesson_number TEXT,
  guided        BOOLEAN     NOT NULL DEFAULT TRUE,
  sections      JSONB       NOT NULL DEFAULT '[]',
  blocks        JSONB       NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ,
  PRIMARY KEY (user_id, id)
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON lessons FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "insert_own" ON lessons FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "update_own" ON lessons FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "delete_own" ON lessons FOR DELETE USING ((SELECT auth.uid()) = user_id);
