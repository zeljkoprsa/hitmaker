import { PracticeSession } from '../core/types/SessionTypes';

/** First-sync merge for a device whose local sessions predate sync: union
 *  by id, newer updatedAt wins per id. After this one-time merge the set
 *  syncs whole-document last-write-wins (see utils/docSync.ts). */
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
