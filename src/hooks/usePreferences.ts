import { useState, useCallback, useEffect, useRef } from 'react';

import { useAuth } from '../context/AuthContext';
import { MetronomeConfig } from '../core/types/MetronomeTypes';
import { supabase } from '../lib/supabase';
import { UserPreferences, isUserPreferences, configToPreferences } from '../types/UserPreferences';

export const usePreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  // Mirror preferences in a ref so savePreferences can read the latest value
  // without needing a functional setState (which caused an infinite save loop).
  const preferencesRef = useRef<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  const loadPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data && isUserPreferences(data)) {
        setPreferences(data);
      } else {
        setPreferences(null);
        if (data) console.warn('Loaded preferences do not match expected schema:', data);
      }
    } catch (err: unknown) {
      console.error('Error loading preferences:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const savePreferences = useCallback(
    async (config: MetronomeConfig, soundId: string) => {
      if (!user) return;
      setSaving(true);

      // Derive the new prefs from the ref (not from a functional setState) so we
      // don't update the preferences state here and avoid re-triggering the
      // MetronomeProvider effect that applies preferences back to the engine.
      const newPrefs = configToPreferences(config, soundId, preferencesRef.current ?? {});
      newPrefs.user_id = user.id;

      if (!navigator.onLine) {
        import('../utils/syncQueue')
          .then(({ addToQueue }) => {
            addToQueue(newPrefs);
            console.log('Offline: Preferences queued for sync.');
          })
          .catch(console.error)
          .finally(() => setSaving(false));
        return;
      }

      // Abort after 8 seconds so the indicator never gets stuck forever
      // (e.g. Supabase free-tier cold start or transient network hang).
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const { error: upsertError } = await supabase
          .from('user_preferences')
          .upsert(newPrefs, { onConflict: 'user_id' })
          .abortSignal(controller.signal);
        clearTimeout(timeoutId);
        if (upsertError) throw upsertError;
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === 'AbortError') {
          console.warn('Preferences save timed out — will retry on next change');
        } else {
          console.error('Error saving preferences:', err);
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

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
