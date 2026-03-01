import { SubdivisionType } from '../../core/types/MetronomeTypes';
import { PracticeSession } from '../../core/types/SessionTypes';

export interface TempoTrainerPreset {
  id: string;
  name: string;
  description: string;
  startBpm: number;
  endBpm: number;
  increment: number;
  minutesPerBlock: number;
  subdivision: SubdivisionType;
}

export const TEMPO_TRAINER_PRESETS: TempoTrainerPreset[] = [
  {
    id: 'preset-warmup',
    name: 'Warm-Up',
    description: '60→120 BPM · Quarter notes',
    startBpm: 60,
    endBpm: 120,
    increment: 5,
    minutesPerBlock: 2,
    subdivision: 'quarter',
  },
  {
    id: 'preset-speed-builder',
    name: 'Speed Builder',
    description: '80→160 BPM · Eighth notes',
    startBpm: 80,
    endBpm: 160,
    increment: 10,
    minutesPerBlock: 2,
    subdivision: 'eighth',
  },
  {
    id: 'preset-endurance',
    name: 'Endurance Push',
    description: '70→110 BPM · 3 min blocks',
    startBpm: 70,
    endBpm: 110,
    increment: 5,
    minutesPerBlock: 3,
    subdivision: 'quarter',
  },
  {
    id: 'preset-quick-burst',
    name: 'Quick Burst',
    description: '100→160 BPM · 1 min blocks',
    startBpm: 100,
    endBpm: 160,
    increment: 10,
    minutesPerBlock: 1,
    subdivision: 'quarter',
  },
];

export const generateTrainerSession = (p: TempoTrainerPreset): PracticeSession => {
  const blocks = [];
  for (let tempo = p.startBpm; tempo <= p.endBpm; tempo += p.increment) {
    blocks.push({
      id: crypto.randomUUID(),
      tempo,
      timeSignature: { beats: 4, noteValue: 4 },
      subdivision: p.subdivision,
      durationMinutes: p.minutesPerBlock,
    });
  }
  return {
    id: crypto.randomUUID(),
    name: p.name,
    blocks,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};
