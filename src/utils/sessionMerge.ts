import { PracticeSession } from '../core/types/SessionTypes';

/** Union two session sets by id — newer per-session updatedAt wins. Runs on
 *  every reconcile where both sides have sessions, so signing in unions the
 *  device's set with the cloud's rather than one silently replacing the
 *  other (JAK-57). Accepted tradeoff: a session deleted on one device can
 *  resurrect from another that still holds it. See utils/docSync.ts. */
export const mergeSessionSets = (
  local: PracticeSession[],
  remote: PracticeSession[]
): PracticeSession[] => {
  const byId = new Map<string, PracticeSession>();
  for (const s of [...remote, ...local]) {
    const existing = byId.get(s.id);
    if (!existing || new Date(s.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
      byId.set(s.id, s);
    }
  }
  return Array.from(byId.values());
};
