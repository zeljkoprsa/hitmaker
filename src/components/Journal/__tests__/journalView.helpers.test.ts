import {
  formatTempos,
  isCurrentOrFutureMonth,
  localDayKey,
  monthGrid,
  sameMonth,
} from '../journalView.helpers';

describe('journal calendar helpers', () => {
  it('localDayKey uses local date parts', () => {
    const d = new Date(2026, 6, 5, 23, 30); // Jul 5 2026, local
    expect(localDayKey(d)).toBe('2026-07-05');
  });

  it('monthGrid returns 42 Monday-first cells covering the month', () => {
    const grid = monthGrid(new Date(2026, 6, 1)); // July 2026
    expect(grid).toHaveLength(42);
    expect(grid[0].getDay()).toBe(1); // starts on a Monday
    expect(grid.some(d => sameMonth(d, new Date(2026, 6, 1)))).toBe(true);
    // July 1 2026 is a Wednesday → grid leads with Mon Jun 29
    expect(localDayKey(grid[0])).toBe('2026-06-29');
  });

  it('blocks navigating into the future (no scheduling)', () => {
    const now = new Date(2026, 6, 15);
    expect(isCurrentOrFutureMonth(new Date(2026, 6, 1), now)).toBe(true); // current
    expect(isCurrentOrFutureMonth(new Date(2026, 7, 1), now)).toBe(true); // future
    expect(isCurrentOrFutureMonth(new Date(2026, 5, 1), now)).toBe(false); // past
  });

  it('formatTempos ranges or singles, and marks silent runs', () => {
    expect(formatTempos([])).toBe('no click');
    expect(formatTempos([70])).toBe('70 BPM');
    expect(formatTempos([60, 120, 90])).toBe('60–120 BPM');
  });
});
