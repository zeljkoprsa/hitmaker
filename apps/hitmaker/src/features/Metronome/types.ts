// src/features/Metronome/types.ts

export type Subdivision = '1' | '2';

export interface TimeSignature {
  beats: number;
  value: number;
}

export interface BeatEvent {
  beatIndex: number;
  time: number;
}
