import { SupabaseClient } from '@supabase/supabase-js';

import { MetronomeConfig } from '../core/types/MetronomeTypes';
import { configToPreferences } from '../types/UserPreferences';

const MIGRATION_KEY = 'metronome_migration_completed';
// Assuming the app stores config in localStorage under 'metronomeState' or similar.
// We need to check the actual key used in MetronomeProvider.
const STORAGE_KEY = 'metronome-config-v1'; // Placeholder, will verify.

export const migratePreferences = async (
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> => {
  const hasMigrated = localStorage.getItem(MIGRATION_KEY);
  if (hasMigrated) return false;

  try {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) {
      // Nothing to migrate
      localStorage.setItem(MIGRATION_KEY, 'true');
      return false;
    }

    const parsedConfig: MetronomeConfig = JSON.parse(localData);
    // Might need validation here

    const preferences = configToPreferences(parsedConfig);
    preferences.user_id = userId;

    const { error } = await supabase.from('user_preferences').insert(preferences);

    if (error) throw error;

    localStorage.setItem(MIGRATION_KEY, 'true');
    console.log('Successfully migrated preferences to Supabase');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
};
