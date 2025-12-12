/**
 * Interface defining the core functionality of the metronome engine.
 * This interface provides methods for initialization, playback control,
 * scheduling, and configuration of the metronome.
 */
import { MetronomeConfig, TimeSignature, SubdivisionType } from '../types/MetronomeTypes';
import { ITickEvent } from './ITickEvent';

export interface IMetronomeEngine {
  /**
   * Initializes the metronome engine with the provided configuration
   * @param config Initial configuration for the metronome
   * @returns Promise that resolves when initialization is complete
   */
  initialize(config: MetronomeConfig): Promise<void>;

  /**
   * Cleans up resources and stops all scheduled events
   * @returns Promise that resolves when cleanup is complete
   */
  dispose(): Promise<void>;

  /**
   * Starts the metronome playback
   * @returns Promise that resolves when playback has started
   */
  start(): Promise<void>;

  /**
   * Stops the metronome playback
   * @returns Promise that resolves when playback has stopped
   */
  stop(): Promise<void>;

  /**
   * Schedules the next tick event
   * @param time Time in milliseconds when the tick should occur
   * @returns Promise that resolves with the scheduled tick event
   */
  scheduleNextTick(time: number): Promise<ITickEvent>;

  /**
   * Updates the tempo of the metronome
   * @param bpm New tempo in beats per minute
   */
  setTempo(bpm: number): void;

  /**
   * Updates the time signature
   * @param timeSignature New time signature
   */
  setTimeSignature(timeSignature: TimeSignature): void;

  /**
   * Updates the subdivision type
   * @param subdivision New subdivision type
   */
  setSubdivision(subdivision: SubdivisionType): void;

  /**
   * Sets the accent pattern for beats in a measure
   * @param accents Array of boolean values indicating which beats should be accented
   */
  setAccents(accents: boolean[]): void;

  /**
   * Adjusts the volume of the metronome
   * @param volume Volume level between 0 and 1
   */
  setVolume(volume: number): void;

  /**
   * Mutes or unmutes the metronome
   * @param muted Whether the metronome should be muted
   */
  setMuted(muted: boolean): void;

  /**
   * Registers a callback for tick events
   * @param callback Function to be called when a tick occurs
   * @returns Function to unregister the callback
   */
  onTick(callback: (event: ITickEvent) => void): () => void;

  /**
   * Gets the current state of the metronome
   * @returns Current configuration of the metronome
   */
  getCurrentState(): MetronomeConfig;

  /**
   * Calculates the duration of one beat at the current tempo
   * @returns Duration in milliseconds
   */
  getBeatDuration(): number;

  /**
   * Checks if the metronome is currently playing
   * @returns True if the metronome is playing, false otherwise
   */
  isPlaying(): boolean;
}
