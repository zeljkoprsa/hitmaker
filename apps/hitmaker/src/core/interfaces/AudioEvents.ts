/**
 * Standardized audio-related events across different sources
 */

// Base event types
export type AudioEventType = 'play' | 'pause' | 'stop' | 'ended' | 'error';

// Base audio event interface
export interface AudioEvent {
  sourceId: string;
  timestamp: number;
}

// Specific event interfaces
export interface PlaybackEvent extends AudioEvent {
  startTime?: number;
}

export interface ErrorEvent extends AudioEvent {
  error: Error;
  message: string;
}

// Event callback type
export type AudioEventCallback = (event: AudioEvent) => void;
