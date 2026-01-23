// import { Database } from './supabase';
import {
  MetronomeConfig,
  AccentLevel,
  TimeSignature,
  SubdivisionType,
} from '../core/types/MetronomeTypes';

export interface UserPreferences {
  id?: string;
  user_id?: string;
  tempo: number;
  time_signature: TimeSignature;
  subdivision: string;
  accents: number[]; // stored as JSONB array of numbers/AccentLevel
  volume: number;
  muted: boolean;
  sound_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface LocalPreferences {
  guest_preferences: UserPreferences;
  migration_completed: boolean;
  last_synced?: number;
}

/**
 * Type guard to check if an object is a valid UserPreferences
 */
export const isUserPreferences = (data: unknown): data is UserPreferences => {
  if (!data || typeof data !== 'object') return false;
  const potentialPrefs = data as Partial<UserPreferences>; // Cast for property access
  return (
    'user_id' in potentialPrefs &&
    typeof potentialPrefs.tempo === 'number' &&
    typeof potentialPrefs.time_signature === 'object' &&
    potentialPrefs.time_signature !== null &&
    'beats' in potentialPrefs.time_signature &&
    'noteValue' in potentialPrefs.time_signature
  );
};

/**
 * Converts internal MetronomeConfig to UserPreferences format
 */
export const configToPreferences = (
  config: MetronomeConfig,
  soundId: string = 'metronome-quartz',
  existingPrefs?: Partial<UserPreferences>
): UserPreferences => {
  return {
    ...existingPrefs,
    tempo: config.tempo,
    time_signature: config.timeSignature,
    subdivision: config.subdivision || 'quarter',
    accents: config.accents || [],
    volume: config.volume ?? 1.0,
    muted: config.muted ?? false,
    sound_id: soundId,
  };
};

/**
 * Converts UserPreferences to internal MetronomeConfig
 */
export const preferencesToConfig = (prefs: UserPreferences): MetronomeConfig => {
  return {
    tempo: prefs.tempo,
    timeSignature: prefs.time_signature,
    subdivision: prefs.subdivision as SubdivisionType, // Cast to specific union type
    accents: prefs.accents as AccentLevel[],
    volume: prefs.volume,
    muted: prefs.muted,
  };
};
