import { SubdivisionType, TimeSignature } from './MetronomeTypes';

export interface SessionBlock {
  id: string;
  label?: string;
  tempo: number;
  timeSignature: TimeSignature;
  subdivision: SubdivisionType;
  durationMinutes: number;
}

export interface PracticeSession {
  id: string;
  name: string;
  blocks: SessionBlock[];
  createdAt: string;
  updatedAt: string;
  isStarter?: boolean;
}
