/**
 * Metronome-specific audio source interface
 */

import {
  SubdivisionType,
  TimeSignature,
  MetronomeEventType,
  MetronomeEvent,
  MetronomeConfig,
} from '../types/MetronomeTypes';

import { AudioEvent } from './AudioEvents';
import { IAudioSource } from './IAudioSource';

export interface MetronomeAudioEvent extends AudioEvent, MetronomeEvent {}

export type MetronomeEventCallback = (event: MetronomeAudioEvent) => void;

export interface IMetronomeSource extends IAudioSource<MetronomeEventType, MetronomeEventCallback> {
  // Metronome-specific properties
  readonly tempo: number;
  readonly timeSignature: TimeSignature;
  readonly subdivision: SubdivisionType;
  readonly accents: boolean[];
  readonly currentBeat: number;
  readonly currentMeasure: number;

  // Configuration
  configure(config: Partial<MetronomeConfig>): void;

  // Metronome Controls
  setTempo(bpm: number): void;
  setTimeSignature(beats: number, noteValue: number): void;
  setSubdivision(subdivision: SubdivisionType): void;
  setAccents(accents: boolean[]): void;
  tapTempo(): void;
  resetCount(): void;
}
