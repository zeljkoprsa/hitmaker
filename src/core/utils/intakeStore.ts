import { IntakeItem, IntakeSource, IntakeStatus } from '../types/IntakeTypes';

/**
 * Pure helpers for the intake inbox (spec #9): per-row merge, display
 * filtering, and YouTube URL detection. Kept free of React/storage/network
 * so they unit-test like lessonStore.
 */

/** Union by id; newer updatedAt wins, local wins ties (the journal/lessons
 *  recipe). Tombstones and status changes are ordinary rows here. */
export const mergeItems = (local: IntakeItem[], remote: IntakeItem[]): IntakeItem[] => {
  const byId = new Map<string, IntakeItem>();
  for (const item of [...remote, ...local]) {
    const existing = byId.get(item.id);
    if (!existing || new Date(item.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
};

/** Non-tombstoned items with the given status, newest capture first. */
export const visibleItems = (items: IntakeItem[], status: IntakeStatus): IntakeItem[] =>
  items
    .filter(i => !i.deletedAt && i.status === status)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

/** Extract a YouTube video id from watch/short/share URL shapes, else null. */
export const parseYouTubeUrl = (url: string): string | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\.|^m\./, '');
  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1).split('/')[0];
    return id || null;
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
    const path = parsed.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/);
    if (path) return path[1];
  }
  return null;
};

export const detectSource = (url: string): IntakeSource =>
  parseYouTubeUrl(url) ? 'youtube' : 'web';

/** True for the http(s) URLs we accept at capture. */
export const isCapturableUrl = (raw: string): boolean => {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
};

export const oembedUrl = (videoUrl: string): string =>
  `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
