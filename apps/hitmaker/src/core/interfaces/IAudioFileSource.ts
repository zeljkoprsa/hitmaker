/**
 * Interface for audio file sources
 */

import { IAudioSource } from './IAudioSource';
import { AudioEvent } from './AudioEvents';

// Audio file-specific event types
export type AudioFileEventType = 
  | 'loading'
  | 'loaded'
  | 'loadError'
  | 'seeking'
  | 'seeked'
  | 'progress'
  | 'timeUpdate';

// Audio file-specific event interface
export interface AudioFileEvent extends AudioEvent {
  duration?: number;
  currentTime?: number;
  buffered?: TimeRanges;
  error?: Error;
  progress?: number;
}

export type AudioFileEventCallback = (event: AudioFileEvent) => void;

export interface AudioFileMetadata {
  duration: number;
  channels: number;
  sampleRate: number;
  bitRate?: number;
  format?: string;
  title?: string;
  artist?: string;
}

export interface IAudioFileSource extends IAudioSource<AudioFileEventType, AudioFileEventCallback> {
  // Audio file-specific properties
  readonly metadata: AudioFileMetadata | null;
  readonly currentTime: number;
  readonly duration: number;
  readonly isLoaded: boolean;
  readonly isLooping: boolean;

  // File loading and management
  load(file: File | string): Promise<void>;
  unload(): void;
  
  // Playback control
  seek(position: number): void;
  setLoop(loop: boolean): void;
  setPlaybackRate(rate: number): void;
}
