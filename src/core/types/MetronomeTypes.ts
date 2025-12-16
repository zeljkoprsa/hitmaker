/**
 * Type definitions for metronome-related entities
 */

export type SubdivisionType = 'quarter' | 'eighth' | 'triplet' | 'sixteenth';

export interface TimeSignature {
  beats: number;
  noteValue: number;
}

export type MetronomeEventType =
  | 'beat'
  | 'measure'
  | 'tempoChange'
  | 'subdivisionChange'
  | 'timeSignatureChange'
  | 'accentChange';

export interface MetronomeEvent {
  beatNumber?: number;
  measureNumber?: number;
  tempo?: number;
  timeSignature?: TimeSignature;
  subdivision?: SubdivisionType;
  accents?: boolean[];
}

export enum AccentLevel {
  Normal = 0, // Low sample
  Accent = 1, // High sample
  Mute = 2, // Silent
}

export interface MetronomeConfig {
  tempo: number;
  timeSignature: TimeSignature;
  subdivision?: SubdivisionType;
  accents?: AccentLevel[]; // Dynamic accent levels
  volume?: number;
  muted?: boolean;
}

export interface MetronomeState extends Required<MetronomeConfig> {
  isPlaying: boolean;
}
