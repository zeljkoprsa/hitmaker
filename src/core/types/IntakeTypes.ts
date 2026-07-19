export type IntakeSource = 'youtube' | 'web';

/** inbox → distilled (linked to the lesson it became) or discarded
 *  (hidden but recoverable via filter). */
export type IntakeStatus = 'inbox' | 'distilled' | 'discarded';

/** A captured web resource (spec #9): a URL thrown at the inbox when found,
 *  distilled into a lesson (or discarded) when there's time. Staging area,
 *  not a library. */
export interface IntakeItem {
  id: string;
  url: string;
  source: IntakeSource;
  title?: string;
  note?: string;
  /** YouTube only, fetched via oEmbed. */
  thumbnailUrl?: string;
  status: IntakeStatus;
  /** Set when distilled: the lesson this item became. */
  lessonId?: string;
  createdAt: string;
  updatedAt: string;
  /** Soft-delete tombstone (ISO); syncs so deletion roams. */
  deletedAt?: string;
  /** Local-only outbox flag; never leaves the client. */
  synced?: boolean;
}
