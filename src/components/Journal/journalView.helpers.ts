import { JournalEntry } from '../../core/types/JournalTypes';

/** Local (not UTC) YYYY-MM-DD key, so entries land on the calendar day the
 *  user actually practiced in their own timezone. */
export const localDayKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const groupByDay = (entries: JournalEntry[]): Map<string, JournalEntry[]> => {
  const map = new Map<string, JournalEntry[]>();
  for (const e of entries) {
    const key = localDayKey(new Date(e.endedAt));
    const bucket = map.get(key);
    if (bucket) bucket.push(e);
    else map.set(key, [e]);
  }
  return map;
};

/** 42 cells (6 weeks) covering the month of `monthStart`, Monday-first. */
export const monthGrid = (monthStart: Date): Date[] => {
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  // JS getDay(): 0=Sun..6=Sat. Shift so Monday=0.
  const lead = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - lead);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
};

export const sameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** True when `month` is at or after the current month (no future nav). */
export const isCurrentOrFutureMonth = (month: Date, now: Date = new Date()): boolean => {
  const m = month.getFullYear() * 12 + month.getMonth();
  const n = now.getFullYear() * 12 + now.getMonth();
  return m >= n;
};

export const formatDuration = (minutes: number): string => {
  const rounded = Math.round(minutes * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded} min` : `${rounded.toFixed(1)} min`;
};

export const formatTempos = (tempos: number[]): string => {
  if (tempos.length === 0) return 'no click';
  if (tempos.length === 1) return `${tempos[0]} BPM`;
  return `${Math.min(...tempos)}–${Math.max(...tempos)} BPM`;
};
