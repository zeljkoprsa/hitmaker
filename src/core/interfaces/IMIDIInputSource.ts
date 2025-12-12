/**
 * Interface for MIDI input sources
 */

import { IAudioSource } from './IAudioSource';
import { AudioEvent } from './AudioEvents';

// MIDI-specific event types
export type MIDIEventType = 
  | 'noteOn'
  | 'noteOff'
  | 'controlChange'
  | 'deviceConnected'
  | 'deviceDisconnected';

// MIDI-specific event interface
export interface MIDIEvent extends AudioEvent {
  note?: number;
  velocity?: number;
  channel?: number;
  controller?: number;
  value?: number;
  deviceId?: string;
}

export type MIDIEventCallback = (event: MIDIEvent) => void;

export interface IMIDIInputSource extends IAudioSource<MIDIEventType, MIDIEventCallback> {
  // MIDI-specific properties
  readonly isConnected: boolean;
  readonly deviceName: string;
  readonly deviceId: string;
  readonly channel: number;

  // MIDI-specific methods
  connect(): Promise<void>;
  disconnect(): void;
  setChannel(channel: number): void;
  
  // MIDI message handling
  onMIDIMessage(callback: MIDIEventCallback): void;
  removeMIDIMessageListener(callback: MIDIEventCallback): void;
}
