/**
 * Base interface for all audio sources (metronome clicks, MIDI inputs, audio files)
 */

import type { AudioEventType, AudioEventCallback } from 'core/interfaces/AudioEvents';

export interface IAudioSource<
  TEventType extends string = AudioEventType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TCallback extends (...args: any[]) => any = AudioEventCallback,
> {
  // Properties
  readonly id: string;
  readonly isInitialized: boolean;
  readonly isPlaying: boolean;

  // Initialization and Cleanup
  init(): Promise<void>;
  dispose(): void;

  // Playback Control
  play(startTime?: number): void;
  pause(): void;
  stop(): void;
  setVolume(volume: number): void;
  setMute(muted: boolean): void;

  // Event Handling
  on(event: TEventType, callback: TCallback): void;
  off(event: TEventType, callback: TCallback): void;
}
