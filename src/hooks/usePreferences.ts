import { useState, useCallback } from 'react';

import { useAuth } from '../context/AuthContext';
import { MetronomeConfig } from '../core/types/MetronomeTypes';
import { supabase } from '../lib/supabase';
import { UserPreferences, isUserPreferences, configToPreferences } from '../types/UserPreferences';
// We need to import the Metronome Context or similar if we want to sync automaticall

export const usePreferences = () => {
  const { user } = useAuth();
  // const supabase = useSupabaseClient(); // Use global client instance
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data && isUserPreferences(data)) {
        setPreferences(data);
      } else {
        // If data is null (no row found) or doesn't match schema, set preferences to null
        setPreferences(null);
        if (data) {
          console.warn('Loaded preferences do not match expected schema:', data);
        }
      }
    } catch (err: unknown) {
      console.error('Error loading preferences:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const [saving, setSaving] = useState(false);

  const savePreferences = useCallback(
    async (config: MetronomeConfig, soundId: string) => {
      if (!user) return;
      setSaving(true);

      const newPrefs = configToPreferences(config, soundId, preferences || {});
      newPrefs.user_id = user.id;

      // Optimistic update locally
      setPreferences(prev => ({ ...prev, ...newPrefs }) as UserPreferences);

      if (!navigator.onLine) {
        // Offline? Add to queue
        import('../utils/syncQueue').then(({ addToQueue }) => {
          addToQueue(newPrefs);
          console.log('Offline: Preferences queued for sync.');
          setSaving(false);
        });
        return;
      }

      try {
        const { error } = await supabase.from('user_preferences').upsert(newPrefs);

        if (error) throw error;
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.error('Error saving preferences:', err);
        setError(errorMessage);
      } finally {
        setSaving(false);
      }
    },
    [user, preferences]
  );

  // Create a default entry if needed
  const createDefaultPreferences = useCallback(
    async (initialConfig: MetronomeConfig) => {
      if (!user) return;
      await savePreferences(initialConfig, 'metronome-quartz');
    },
    [user, savePreferences]
  );

  return {
    preferences,
    loading,
    saving,
    error,
    loadPreferences,
    savePreferences,
    createDefaultPreferences,
  };
};
