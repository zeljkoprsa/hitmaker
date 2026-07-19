-- Spec #9: Intake inbox. Per-row like lessons — one row per captured item,
-- keyed (user_id, id). Status moves (inbox → distilled/discarded) are
-- ordinary row updates under per-row updatedAt LWW; deleted_at is the
-- soft-delete tombstone so a deletion on one device roams to the others.

CREATE TABLE IF NOT EXISTS intake_items (
  id            TEXT        NOT NULL,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url           TEXT        NOT NULL,
  source        TEXT        NOT NULL DEFAULT 'web',
  title         TEXT,
  note          TEXT,
  thumbnail_url TEXT,
  status        TEXT        NOT NULL DEFAULT 'inbox',
  lesson_id     TEXT,
  created_at    TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ,
  PRIMARY KEY (user_id, id)
);

ALTER TABLE intake_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON intake_items FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "insert_own" ON intake_items FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "update_own" ON intake_items FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "delete_own" ON intake_items FOR DELETE USING ((SELECT auth.uid()) = user_id);
