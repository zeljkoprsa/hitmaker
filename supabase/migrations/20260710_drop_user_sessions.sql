-- Post-promotion cleanup for the roaming sync feature: My Sessions now sync
-- as a whole document in sync_documents (see 20260710_sync_documents.sql),
-- so the per-row user_sessions table is unused. It held 0 rows at drop time.
-- Stale clients running the pre-sync build fail its writes silently and
-- keep working from localStorage until they update.
--
-- session_history is unrelated and stays.

DROP TABLE IF EXISTS user_sessions;
