import { PracticeSession } from './SessionTypes';

/** A lesson stored as data (spec #7): a guided PracticeSession plus catalog
 *  metadata, a soft-delete tombstone, and a local-only outbox flag. */
export interface Lesson extends PracticeSession {
  guided: true;
  /** Display sequence ("01") — manual and editable, not derived from order. */
  lessonNumber?: string;
  /** Soft-delete tombstone (ISO). Synced, so a deletion roams to other
   *  devices instead of being resurrected by union-merge. UI filters these. */
  deletedAt?: string;
  /** Local-only outbox flag; never leaves the client. */
  synced?: boolean;
}
