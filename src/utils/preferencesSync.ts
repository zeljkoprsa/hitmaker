/**
 * Last-write-wins decision for metronome preferences at sign-in (JAK-57).
 *
 * Server preferences used to apply unconditionally, reverting settings the
 * user changed while signed out on this device (and then pushing the stale
 * values back). Apply the server config only when it is strictly newer than
 * the locally persisted one.
 */
export const shouldApplyServerConfig = (
  localUpdatedAt: string | null | undefined,
  serverUpdatedAt: string | null | undefined
): boolean => {
  // No local stamp (fresh device, or pre-JAK-57 config) → server wins.
  if (!localUpdatedAt) return true;
  // Local is stamped but the server row has no timestamp → keep local.
  if (!serverUpdatedAt) return false;
  // Otherwise the more recent side wins; a tie keeps local (avoids churn).
  return new Date(serverUpdatedAt).getTime() > new Date(localUpdatedAt).getTime();
};
