const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function isRecentlyActive(lastSeenAt: Date | string | null | undefined, now = Date.now()) {
  if (!lastSeenAt) return false;
  const timestamp = lastSeenAt instanceof Date ? lastSeenAt.getTime() : new Date(lastSeenAt).getTime();
  if (Number.isNaN(timestamp)) return false;
  return now - timestamp <= ONLINE_WINDOW_MS;
}
