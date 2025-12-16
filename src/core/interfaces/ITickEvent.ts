/**
 * Interface representing a metronome tick event.
 * This interface defines the structure of events emitted on each metronome tick,
 * providing timing information and context about the current musical state.
 */
import { SubdivisionType, TimeSignature, AccentLevel } from '../types/MetronomeTypes';

export interface ITickEvent {
  /**
   * The type of metronome event that occurred
   */
  type: 'beat';

  /**
   * High-precision timestamp of when the tick occurred
   */
  timestamp: number;

  /**
   * The current beat number within the measure (1-based)
   */
  beatNumber: number;

  /**
   * The current measure number (1-based)
   */
  measureNumber: number;

  /**
   * Current tempo in beats per minute (BPM)
   */
  tempo: number;

  /**
   * Current time signature
   */
  timeSignature: TimeSignature;

  /**
   * Current subdivision type being used
   */
  subdivision?: SubdivisionType;

  /**
   * The accent level of this beat (Normal, Accent, Mute)
   */
  accentLevel: AccentLevel;

  /**
   * The duration of one beat at the current tempo (in milliseconds)
   */
  beatDuration: number;

  /**
   * Scheduled time for the next tick (in milliseconds)
   */
  nextTickTime: number;
}
