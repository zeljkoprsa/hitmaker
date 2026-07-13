import { SessionBlock } from '../../types/SessionTypes';
import { blockAutoAdvances, blockDrivesMetronome, blockHasCountdown } from '../sessionBlocks';

const block = (overrides: Partial<SessionBlock>): SessionBlock => ({
  id: 'b',
  durationMinutes: 4,
  ...overrides,
});

describe('guided block semantics', () => {
  it('classic (untyped) blocks never auto-advance — Workouts keep manual Next', () => {
    expect(blockAutoAdvances(block({ tempo: 80 }))).toBe(false);
  });

  it('do and break blocks auto-advance on their timers', () => {
    expect(blockAutoAdvances(block({ type: 'do', tempo: 60 }))).toBe(true);
    expect(blockAutoAdvances(block({ type: 'break' }))).toBe(true);
  });

  it('teach blocks never auto-advance and show no countdown', () => {
    expect(blockAutoAdvances(block({ type: 'teach' }))).toBe(false);
    expect(blockHasCountdown(block({ type: 'teach' }))).toBe(false);
    expect(blockHasCountdown(block({ type: 'do', tempo: 60 }))).toBe(true);
    expect(blockHasCountdown(block({ tempo: 80 }))).toBe(true);
  });

  it('only blocks with a tempo drive the metronome', () => {
    expect(blockDrivesMetronome(block({ tempo: 60 }))).toBe(true);
    expect(blockDrivesMetronome(block({ type: 'do' }))).toBe(false); // free play
    expect(blockDrivesMetronome(block({ type: 'break' }))).toBe(false);
    expect(blockDrivesMetronome(block({ type: 'teach' }))).toBe(false);
  });
});
