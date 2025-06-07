/**
 * Barrel exports for core interfaces
 */

// Base audio interfaces and types
export * from './AudioEvents';
export * from './IAudioSource';
export * from './IAudioService';

// Metronome-specific interfaces and types
export * from './IMetronomeSource';
export * from './ITickEvent';
export * from './IMetronomeEngine';
export * from './IOutputSource';
export * from '../types/MetronomeTypes';

// MIDI interfaces and types
export * from './IMIDIInputSource';

// Audio file interfaces and types
export * from './IAudioFileSource';

// Re-export common types that might be needed across different modules
export type {
  AudioEvent,
  AudioEventType,
  AudioEventCallback
} from './AudioEvents';
