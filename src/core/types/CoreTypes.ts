/**
 * Core type definitions and documentation for the metronome system.
 * This file provides comprehensive type definitions, documentation,
 * and usage examples for the core interfaces and types.
 * 
 * @packageDocumentation
 */

import { 
  MetronomeConfig
} from './MetronomeTypes';
import { ITickEvent } from '../interfaces/ITickEvent';
import { IOutputSource, OutputSourceConfig } from '../interfaces/IOutputSource';

/**
 * Represents a callback function for handling tick events
 * @param event The tick event containing timing and state information
 */
export type TickEventCallback = (event: ITickEvent) => void;

/**
 * Represents a callback function for handling errors
 * @param error The error that occurred
 */
export type ErrorCallback = (error: Error) => void;

/**
 * Represents a callback function for handling state changes
 * @param enabled The new enabled state
 */
export type StateChangeCallback = (enabled: boolean) => void;

/**
 * Configuration options for initializing a metronome engine
 * @example
 * ```typescript
 * const config: MetronomeEngineConfig = {
 *   tempo: 120,
 *   timeSignature: { beats: 4, noteValue: 4 },
 *   subdivision: 'quarter',
 *   outputs: [
 *     { type: 'audio', id: 'click', enabled: true },
 *     { type: 'visual', id: 'animation', enabled: true }
 *   ]
 * };
 * ```
 */
export interface MetronomeEngineConfig extends MetronomeConfig {
  /**
   * Array of output configurations
   */
  outputs?: OutputSourceConfig[];
}

/**
 * Factory function type for creating output sources
 * @example
 * ```typescript
 * const createAudioOutput: OutputSourceFactory = async (config) => {
 *   const output = new AudioOutputSource(config);
 *   await output.initialize(config);
 *   return output;
 * };
 * ```
 */
export type OutputSourceFactory = (config: OutputSourceConfig) => Promise<IOutputSource>;

/**
 * Example usage of the metronome engine:
 * ```typescript
 * // Initialize the metronome engine
 * const engine = new MetronomeEngine();
 * await engine.initialize({
 *   tempo: 120,
 *   timeSignature: { beats: 4, noteValue: 4 },
 *   outputs: [
 *     { type: 'audio', id: 'click', enabled: true }
 *   ]
 * });
 * 
 * // Register tick event handler
 * engine.onTick((event: ITickEvent) => {
 *   console.log(`Beat ${event.beatNumber} of measure ${event.measureNumber}`);
 * });
 * 
 * // Start playback
 * await engine.start();
 * 
 * // Change tempo
 * engine.setTempo(140);
 * 
 * // Stop playback
 * await engine.stop();
 * ```
 * 
 * Example of implementing a custom output source:
 * ```typescript
 * class VisualOutputSource implements IOutputSource {
 *   readonly id: string;
 *   readonly type: 'visual';
 *   private enabled = false;
 *   private initialized = false;
 * 
 *   constructor(id: string) {
 *     this.id = id;
 *   }
 * 
 *   async initialize(config: OutputSourceConfig): Promise<void> {
 *     this.enabled = config.enabled ?? true;
 *     this.initialized = true;
 *   }
 * 
 *   async processTick(event: ITickEvent): Promise<void> {
 *     if (!this.enabled) return;
 *     // Implement visual feedback for the tick
 *     this.updateVisualElement(event);
 *   }
 * 
 *   // ... implement other required methods
 * }
 * ```
 */

/**
 * Type guard to check if an object implements ITickEvent
 * @param obj Object to check
 * @returns True if the object implements ITickEvent
 */
export function isTickEvent(obj: unknown): obj is ITickEvent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    'timestamp' in obj &&
    'beatNumber' in obj &&
    'measureNumber' in obj
  );
}

/**
 * Type guard to check if an object implements IOutputSource
 * @param obj Object to check
 * @returns True if the object implements IOutputSource
 */
export function isOutputSource(obj: unknown): obj is IOutputSource {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'initialize' in obj &&
    'processTick' in obj
  );
}

/**
 * Utility type for metronome event handlers
 */
export type MetronomeEventHandler<T> = {
  [K in import('./MetronomeTypes').MetronomeEventType]: (data: T) => void;
};

/**
 * Type for metronome state updates
 * @example
 * ```typescript
 * const update: MetronomeStateUpdate = {
 *   property: 'tempo',
 *   value: 130,
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface MetronomeStateUpdate {
  property: keyof MetronomeConfig;
  value: unknown;
  timestamp: number;
}
