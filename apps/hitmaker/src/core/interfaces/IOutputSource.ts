/**
 * Interface for metronome output sources (audio, visual, MIDI, etc.)
 * Defines the contract for how different output types should handle
 * metronome events and manage their lifecycle.
 */
import { MetronomeConfig } from '../types/MetronomeTypes';

import { ITickEvent } from './ITickEvent';

export type OutputSourceType = 'audio' | 'visual' | 'midi' | 'custom' | 'sample' | 'webAudio';

export interface OutputSourceConfig {
  /**
   * Type of output source
   */
  type: OutputSourceType;

  /**
   * Unique identifier for this output source
   */
  id: string;

  /**
   * Initial enabled state
   */
  enabled?: boolean;

  /**
   * Output-specific configuration options
   */
  options?: Record<string, unknown>;
}

export interface IOutputSource {
  /**
   * Unique identifier for the output source
   */
  readonly id: string;

  /**
   * Type of output source
   */
  readonly type: OutputSourceType;

  /**
   * Whether the output source is initialized
   */
  readonly isInitialized: boolean;

  /**
   * Whether the output source is currently enabled
   */
  readonly isEnabled: boolean;

  /**
   * Initializes the output source with provided configuration
   * @param config Configuration for the output source
   */
  initialize(config: OutputSourceConfig): Promise<void>;

  /**
   * Cleans up resources and removes event listeners
   */
  dispose(): Promise<void>;

  /**
   * Processes and outputs a tick event
   * @param event Tick event to process
   */
  processTick(event: ITickEvent): Promise<void>;

  /**
   * Updates the output source configuration based on metronome settings
   * @param config Current metronome configuration
   */
  updateConfig(config: MetronomeConfig): Promise<void>;

  /**
   * Enables or disables the output source
   * @param enabled Whether the output should be enabled
   */
  setEnabled(enabled: boolean): void;

  /**
   * Prepares the output source for the next tick
   * @param time Time in milliseconds when the next tick will occur
   */
  prepareNextTick(time: number): Promise<void>;

  /**
   * Handles errors that occur during output processing
   * @param error Error that occurred
   */
  handleError(error: Error): void;

  /**
   * Resets the output source to its initial state
   */
  reset(): Promise<void>;

  /**
   * Gets the current configuration of the output source
   */
  getConfig(): OutputSourceConfig;

  /**
   * Registers an error handler callback
   * @param handler Function to handle errors
   * @returns Function to unregister the handler
   */
  onError(handler: (error: Error) => void): () => void;

  /**
   * Registers a state change callback
   * @param handler Function to handle state changes
   * @returns Function to unregister the handler
   */
  onStateChange(handler: (enabled: boolean) => void): () => void;
}
