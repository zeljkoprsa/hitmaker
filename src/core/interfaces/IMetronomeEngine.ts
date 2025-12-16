import { MetronomeConfig, TimeSignature, SubdivisionType, AccentLevel } from '../types/MetronomeTypes';

import { ITickEvent } from './ITickEvent';

export interface IMetronomeEngine {
  // ...
  initialize(config: MetronomeConfig): Promise<void>;
  dispose(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  scheduleNextTick(time: number): Promise<ITickEvent>;
  setTempo(bpm: number): void;
  setTimeSignature(timeSignature: TimeSignature): void;
  setSubdivision(subdivision: SubdivisionType): void;

  /**
   * Sets the accent pattern for beats in a measure
   * @param accents Array of AccentLevel values indicating beat emphasis
   */
  setAccents(accents: AccentLevel[]): void;

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
