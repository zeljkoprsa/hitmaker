-- Spec #4: the practice Queue is removed. Its sync document is dropped
-- (discarded, not migrated — accepted decision, single user), and the
-- doc_key constraint tightens so a stale pre-#4 client that still has a
-- dirty local queue can't quietly resurrect the row; its pushes fail and
-- the offline-first client tolerates that until it updates.
--
-- The sessions doc is untouched and continues to roam.

DELETE FROM sync_documents WHERE doc_key = 'queue';

ALTER TABLE sync_documents DROP CONSTRAINT sync_documents_doc_key_check;
ALTER TABLE sync_documents
  ADD CONSTRAINT sync_documents_doc_key_check CHECK (doc_key IN ('sessions'));
