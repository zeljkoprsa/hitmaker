-- Spec #6: Practice Journal. A per-row, append-heavy log of practice runs —
-- deliberately NOT the whole-document sync_documents pattern (which would
-- rewrite a growing blob per entry and risk discarding another device's
-- entries on a last-write-wins conflict). One row per run; ids are minted
-- client-side per run, so two devices never contend for the same row.
--
-- The client is local-first: entries live in localStorage and flush here via
-- an outbox when signed in + online. Reflections are an editable single-field
-- update; updated_at drives per-entry convergence on load.

CREATE TABLE IF NOT EXISTS practice_journal (
  id               UUID        PRIMARY KEY,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_type         TEXT        NOT NULL CHECK (run_type IN ('session', 'workout', 'lesson')),
  source_id        UUID,                   -- originating session id; NULL for workouts/lessons (non-UUID ids)
  name             TEXT        NOT NULL,
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ NOT NULL,
  duration_minutes NUMERIC     NOT NULL,
  status           TEXT        NOT NULL CHECK (status IN ('completed', 'abandoned')),
  blocks_total     INT         NOT NULL,
  blocks_completed INT         NOT NULL,
  components       JSONB       NOT NULL DEFAULT '[]',  -- [{ label, tempos: number[] }]
  reflection       TEXT,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS practice_journal_user_ended_idx
  ON practice_journal (user_id, ended_at DESC);

ALTER TABLE practice_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own" ON practice_journal FOR SELECT USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "insert_own" ON practice_journal FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "update_own" ON practice_journal FOR UPDATE USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "delete_own" ON practice_journal FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- Absorb existing session_history rows as minimal completed entries so no
-- prior practice trace is lost. session_history is thin (name/blocks/duration/
-- date), so components is empty and started_at is approximated from ended_at.
INSERT INTO practice_journal (
  id, user_id, run_type, source_id, name, started_at, ended_at,
  duration_minutes, status, blocks_total, blocks_completed, components, updated_at
)
SELECT
  id,
  user_id,
  CASE WHEN session_id IS NULL THEN 'workout' ELSE 'session' END,
  session_id,
  session_name,
  completed_at - make_interval(mins => total_duration_minutes::int),
  completed_at,
  total_duration_minutes,
  'completed',
  blocks_completed,
  blocks_completed,
  '[]'::jsonb,
  completed_at
FROM session_history
ON CONFLICT (id) DO NOTHING;
