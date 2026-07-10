import { blockDrivesMetronome } from '../../../../core/utils/sessionBlocks';
import { GROOVE_IS_IN_THE_HEART } from '../grooveIsInTheHeart';

/** Guards the spec #3 migration promise: every section of the original
 *  read-only lesson card survives in the block model — nothing lost. */
describe('Groove Is In The Heart — guided run data', () => {
  const blocks = GROOVE_IS_IN_THE_HEART.blocks;
  const allText = JSON.stringify(GROOVE_IS_IN_THE_HEART);

  it('is a guided lesson with every block typed', () => {
    expect(GROOVE_IS_IN_THE_HEART.guided).toBe(true);
    expect(blocks.length).toBeGreaterThan(0);
    for (const b of blocks) {
      expect(['teach', 'do', 'break']).toContain(b.type);
      expect(b.durationMinutes).toBeGreaterThan(0);
    }
  });

  it('carries all five sections of the original card', () => {
    for (const section of [
      'Stretching',
      'Free Expression',
      'Single Strokes', // Hand Sticking
      'Around the Kit', // Hand Sticking
      'Bass Drum', // Leg Independence
      'Hi-Hat / Kick Alternates', // Leg Independence
      'Hi-Hat Riding',
    ]) {
      expect(blocks.some(b => b.label === section)).toBe(true);
    }
  });

  it('carries the Mission and the mantra', () => {
    expect(allText).toContain('Groove and flow above all');
    expect(allText).toContain('Record → listen back → iterate');
    expect(allText).toContain('HAVE FUN ✦');
  });

  it('keeps the original BPM ranges as tuning notes', () => {
    expect(allText).toContain('50–120');
  });

  it('has explicit rest blocks and a silent free-play block', () => {
    expect(blocks.filter(b => b.type === 'break').length).toBeGreaterThanOrEqual(2);
    const freePlay = blocks.find(b => b.label === 'Free Expression');
    expect(freePlay?.type).toBe('do');
    expect(blockDrivesMetronome(freePlay!)).toBe(false);
  });

  it('opens by waiting for the drummer (teach), not with a count-off', () => {
    expect(blocks[0].type).toBe('teach');
  });
});
