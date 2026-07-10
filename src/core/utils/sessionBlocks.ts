import { SessionBlock } from '../types/SessionTypes';

/** Whether this block runs the metronome (teach/break/free-play blocks don't). */
export const blockDrivesMetronome = (block: SessionBlock): boolean => block.tempo != null;

/** Whether this block's timer advances the run by itself when it elapses.
 *  Only typed lesson blocks auto-advance; classic (untyped) blocks keep the
 *  overtime-and-manual-Next behavior Starters rely on. */
export const blockAutoAdvances = (block: SessionBlock): boolean =>
  block.type === 'do' || block.type === 'break';

/** Whether this block shows a hard countdown. teach blocks are untimed —
 *  the coach waits for the drummer before a concept, never counts them off it. */
export const blockHasCountdown = (block: SessionBlock): boolean => block.type !== 'teach';
