/**
 * Service interface for managing multiple audio sources and global audio operations
 */

import { IAudioSource } from './IAudioSource';
import { AudioEvent } from './AudioEvents';

// Service-specific event types
export type AudioServiceEventType = 
  | 'sourceAdded' 
  | 'sourceRemoved'
  | 'globalVolumeChanged'
  | 'globalMuteChanged';

// Service-specific event interface
export interface AudioServiceEvent extends AudioEvent {
  serviceId: string;
}

// Service event callback type
export type AudioServiceEventCallback = (event: AudioServiceEvent) => void;

export interface IAudioService {
  // Source Management
  registerSource(source: IAudioSource): void;
  unregisterSource(sourceId: string): void;
  getSourceById(sourceId: string): IAudioSource | undefined;
  
  // Global Controls
  playAll(): void;
  pauseAll(): void;
  stopAll(): void;
  setGlobalVolume(volume: number): void;
  muteAll(): void;
  unmuteAll(): void;

  // Event Handling
  on(event: AudioServiceEventType, callback: AudioServiceEventCallback): void;
  off(event: AudioServiceEventType, callback: AudioServiceEventCallback): void;

  // Service Properties
  readonly sources: ReadonlyMap<string, IAudioSource>;
  readonly globalVolume: number;
  readonly isMuted: boolean;
}
