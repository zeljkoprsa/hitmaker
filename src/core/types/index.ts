/**
 * Barrel exports for core types
 */

// Metronome Types
export type {
  MetronomeConfig,
  TimeSignature,
  SubdivisionType,
  MetronomeEventType,
  MetronomeEvent,
} from './MetronomeTypes';

// Core Types
export type {
  TickEventCallback,
  ErrorCallback,
  StateChangeCallback,
  MetronomeEngineConfig,
  OutputSourceFactory,
  MetronomeEventHandler,
  MetronomeStateUpdate,
} from './CoreTypes';

// Type Guards
export { isTickEvent, isOutputSource } from './CoreTypes';

// Sound Types
export type { Sound } from './SoundTypes';
export { SOUNDS, getSoundById } from './SoundTypes';
