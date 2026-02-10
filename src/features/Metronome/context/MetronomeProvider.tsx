import { EventEmitter } from 'events';

import React, {
  createContext,
  useState,
  useRef,
  useContext,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from 'react';

import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Metronome } from '../../../core/engine/Metronome';
import { ITickEvent } from '../../../core/interfaces/ITickEvent';
import { OutputSourceRegistry } from '../../../core/output/OutputSourceRegistry';
import { SampleAudioSource } from '../../../core/output/SampleAudioSource';
import {
  TimeSignature,
  SubdivisionType,
  AccentLevel,
  MetronomeConfig,
} from '../../../core/types/MetronomeTypes';
import { getSoundById } from '../../../core/types/SoundTypes';
import { usePreferences } from '../../../hooks/usePreferences';
import { supabase } from '../../../lib/supabase';
import { preferencesToConfig } from '../../../types/UserPreferences';
import { logger } from '../../../utils/logger';
import { migratePreferences } from '../../../utils/migratePreferences';

// Internal type to bridge UI TimeSignature and engine TimeSignature
// Currently unused but kept for future reference
type _MetronomeTimeSignature = {
  beats: number;
  noteValue: number;
};

// Define the context interface
interface MetronomeContextType {
  isPlaying: boolean;
  tempo: number;
  timeSignature: TimeSignature;
  subdivision: SubdivisionType;
  accents: AccentLevel[];
  volume: number;
  muted: boolean;
  soundId: string;
  isLoadingSound: boolean;
  isSaving: boolean;
  togglePlay: () => Promise<void>;
  setTempo: (bpm: number) => void;
  setTimeSignature: (timeSignature: TimeSignature) => void;
  setSubdivision: (subdivision: SubdivisionType) => void;
  setAccents: (accents: AccentLevel[]) => void;
  toggleAccent: (index: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setSound: (soundId: string) => Promise<void>;
  onTick: (callback: (event: ITickEvent) => void) => () => void;
}

// Create the context with default values
const MetronomeContext = createContext<MetronomeContextType | null>(null);

// Map UI subdivision values to engine subdivision types
// Formerly used '1' and '2', now using direct types

// Provider component
export const MetronomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a consistent metronome instance
  const [metronome] = useState(() => new Metronome());
  const outputRegistryRef = useRef<OutputSourceRegistry | null>(null);
  const emitterRef = useRef<EventEmitter>(new EventEmitter());
  const cleanupRef = useRef<(() => void) | null>(null);

  // Subscribe to engine state
  const state = useSyncExternalStore(metronome.subscribe, metronome.getSnapshot);
  // console.log('[MetronomeProvider] Render with isPlaying:', state.isPlaying);

  // Local state for sound management (not part of engine core config yet)
  const [soundId, setSoundIdState] = useState(() => {
    const savedSound = localStorage.getItem('metrodome-sound-preference');
    return savedSound || 'metronome-quartz';
  });
  const [isLoadingSound, setIsLoadingSound] = useState(false);

  // Initialize the metronome only once when the component mounts
  useEffect(() => {
    const initMetronome = async () => {
      try {
        const outputRegistry = OutputSourceRegistry.getInstance();
        outputRegistryRef.current = outputRegistry;

        // Initialize with defaults (or could start loading saved prefs here)
        await metronome.initialize(metronome.getSnapshot());

        // handle URL shortcuts (e.g., ?tempo=120&play=true)
        const params = new URLSearchParams(window.location.search);
        const tempoParam = params.get('tempo');
        const playParam = params.get('play');

        if (tempoParam) {
          const bpm = parseInt(tempoParam, 10);
          if (!isNaN(bpm) && bpm >= 30 && bpm <= 500) {
            metronome.setTempo(bpm);
          }
        }

        if (playParam === 'true') {
          // Short delay to ensure audio context can wake up if possible,
          // though this often requires user gesture logic deeper in the stack.
          // Metronome.start() handles context.resume() which might throw/warn if blocked.
          metronome.start().catch(err => console.warn('Autoplay blocked:', err));
        }

        // Clean up URL parameters to prevent re-applying on refresh if desired
        if (tempoParam || playParam) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }

        // Set up tick event handler
        const stopListening = metronome.onTick(event => {
          emitterRef.current.emit('tick', event);
        });

        // Set up error handler
        const stopErrors = metronome.onError(error => {
          logger.error('Metronome error:', error);
        });

        // Initialize sound selection
        await initializeSound(soundId);

        // Save cleanup function
        cleanupRef.current = () => {
          stopListening();
          stopErrors();
        };
      } catch (error) {
        logger.error('Failed to initialize metronome:', error);
      }
    };

    // Helper function to initialize sound (kept local as it drives the OutputRegistry)
    const initializeSound = async (initialSoundId: string) => {
      try {
        setIsLoadingSound(true);
        const registry = outputRegistryRef.current;
        if (!registry) return;

        const sound = getSoundById(initialSoundId);
        if (!sound) return;

        let sampleSource = registry.getSource('sample') as SampleAudioSource;

        if (!sampleSource) {
          // Double check to avoid race conditions
          const existing = registry.getSource('sample');
          if (existing) {
            sampleSource = existing as SampleAudioSource;
          } else {
            sampleSource = new SampleAudioSource({
              id: 'sample',
              type: 'sample',
              enabled: true,
              options: {
                volume: state.volume,
                muted: state.muted,
                soundId: initialSoundId,
              },
            });

            await sampleSource.initialize({
              id: 'sample',
              type: 'sample',
              enabled: true,
              options: {
                volume: state.volume,
                muted: state.muted,
                soundId: initialSoundId,
              },
            });

            try {
              await registry.createSource('sample', sampleSource);
            } catch (e) {
              // Ignore if it was created in the meantime
              const retry = registry.getSource('sample');
              if (retry) sampleSource = retry as SampleAudioSource;
            }
          }
        }

        await sampleSource.setSound(initialSoundId);
        registry.setActiveSource('sample');
      } catch (error) {
        console.error('Error initializing sound:', error);
      } finally {
        setIsLoadingSound(false);
      }
    };

    initMetronome();

    return () => {
      if (cleanupRef.current) cleanupRef.current();
      metronome.dispose().catch(console.error);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------------
  // Auth & Preference Sync
  // --------------------------------------------------------
  const { user } = useAuth();
  const { preferences, loadPreferences, savePreferences, saving } = usePreferences();
  const { showToast } = useToast();

  // 1. On login: Migrate & Load
  useEffect(() => {
    if (user) {
      migratePreferences(supabase, user.id).then(migrated => {
        if (migrated) showToast('Preferences migrated to cloud', 'success');
        loadPreferences();
      });
    }
  }, [user, loadPreferences, showToast]);

  // 2. When preferences load from server: Apply to engine
  useEffect(() => {
    if (preferences && metronome) {
      // Apply values to metronome engine
      // We compare to avoid unnecessary updates if possible, but setters usually handle no-op.
      const config = preferencesToConfig(preferences);

      // Batch updates if Metronome class supported it, otherwise sequential
      if (config.tempo) metronome.setTempo(config.tempo);
      if (config.timeSignature) metronome.setTimeSignature(config.timeSignature);
      if (config.subdivision) metronome.setSubdivision(config.subdivision);
      if (config.accents) metronome.setAccents(config.accents);
      if (config.volume !== undefined) metronome.setVolume(config.volume);
      if (config.muted !== undefined) metronome.setMuted(config.muted);

      // Sound ID is managed locally in provider for now
      if (preferences.sound_id && preferences.sound_id !== soundId) {
        setSound(preferences.sound_id).catch(err => console.warn('Failed to sync sound', err));
      }
    }
    // We only want to run this when 'preferences' object reference changes (loaded/updated from server)
    // NOT when we save to it locally (optimistic) - wait, optimistic update changes the ref too.
    // If we optimistically update, this effect runs again and re-sets the engine.
    // This is circular if setTempo triggers state change -> save -> optimistic set -> load effect -> setTempo.
    // However, if setTempo is no-op for same value, loop breaks.
    // Metronome engine setters SHOULD be no-op if value is same.
  }, [preferences, metronome]);

  // 3. When engine state changes: Save to server (Debounced)
  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      const currentConfig: MetronomeConfig = {
        tempo: state.tempo,
        timeSignature: state.timeSignature,
        subdivision: state.subdivision,
        accents: state.accents || [],
        volume: state.volume,
        muted: state.muted,
      };

      savePreferences(currentConfig, soundId);
    }, 2000); // 2s debounce - reduces database writes while still feeling responsive

    return () => clearTimeout(timer);
  }, [
    state.tempo,
    state.timeSignature,
    state.subdivision,
    state.accents,
    state.volume,
    state.muted,
    soundId,
    user,
    savePreferences,
  ]);

  // 4. Sync on Reconnect
  useEffect(() => {
    const handleOnline = () => {
      logger.info('Network online. Processing sync queue...');
      showToast('Online: syncing changes...', 'info');
      if (user) {
        import('../../../utils/syncQueue').then(({ processQueue }) => {
          processQueue(supabase, user.id).then(() => {
            // Reload to ensure we match server state (in case server had newer data we deferred to, or just to confirm)
            loadPreferences();
            showToast('Sync complete', 'success');
          });
        });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, loadPreferences, showToast]);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    try {
      if (metronome.isPlaying()) {
        await metronome.stop();
      } else {
        await metronome.start();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [metronome]);

  // Setters - Direct delegations
  const setTempo = useCallback((bpm: number) => metronome.setTempo(bpm), [metronome]);
  const setTimeSignature = useCallback(
    (ts: TimeSignature) => metronome.setTimeSignature(ts),
    [metronome]
  );
  const setSubdivision = useCallback(
    (sd: SubdivisionType) => metronome.setSubdivision(sd),
    [metronome]
  );
  const setAccents = useCallback((acc: AccentLevel[]) => metronome.setAccents(acc), [metronome]);

  const toggleAccent = useCallback(
    (index: number) => {
      const currentAccents = metronome.getCurrentState().accents;
      if (!currentAccents) return;

      const newAccents = [...currentAccents];
      if (index >= 0 && index < newAccents.length) {
        // Cycle: Normal (0) -> Accent (1) -> Mute (2) -> Normal (0)
        let level = newAccents[index];
        if (level === AccentLevel.Normal) level = AccentLevel.Accent;
        else if (level === AccentLevel.Accent) level = AccentLevel.Mute;
        else level = AccentLevel.Normal;

        newAccents[index] = level;
        metronome.setAccents(newAccents);
      }
    },
    [metronome]
  );

  const setVolume = useCallback((vol: number) => metronome.setVolume(vol), [metronome]);
  const setMuted = useCallback((m: boolean) => metronome.setMuted(m), [metronome]);

  // Set sound - distinct because it interacts with the registry/persistence
  const setSound = useCallback(
    async (newSoundId: string) => {
      try {
        setIsLoadingSound(true);
        const registry = outputRegistryRef.current;
        if (!registry) return;

        const sound = getSoundById(newSoundId);
        if (!sound) return;

        // Ensure source exists (lazy creation if needed, though init handles it)
        let sampleSource = registry.getSource('sample') as SampleAudioSource;
        if (!sampleSource) {
          // Fallback creation if not present
          sampleSource = new SampleAudioSource({
            id: 'sample',
            type: 'sample',
            enabled: true,
            options: { volume: state.volume, muted: state.muted, soundId: newSoundId },
          });
          await sampleSource.initialize(sampleSource.getConfig());
          await registry.createSource('sample', sampleSource);
        }

        await sampleSource.setSound(newSoundId);
        registry.setActiveSource('sample');

        setSoundIdState(newSoundId);
        localStorage.setItem('metrodome-sound-preference', newSoundId);
      } catch (error) {
        logger.error('Error setting sound:', error);
      } finally {
        setIsLoadingSound(false);
      }
    },
    [state.volume, state.muted]
  );

  // Register tick callback
  const onTick = useCallback((callback: (event: ITickEvent) => void) => {
    const emitter = emitterRef.current;
    emitter.on('tick', callback);
    return () => {
      emitter.off('tick', callback);
    };
  }, []);

  // Context value constructed from the synced state
  const contextValue: MetronomeContextType = {
    isPlaying: state.isPlaying,
    tempo: state.tempo,
    timeSignature: state.timeSignature,
    subdivision: state.subdivision,
    accents: state.accents || [],
    volume: state.volume,
    muted: state.muted,
    soundId,
    isLoadingSound,
    isSaving: saving,
    togglePlay,
    setTempo,
    setTimeSignature,
    setSubdivision,
    setAccents,
    toggleAccent,
    setVolume,
    setMuted,
    setSound,
    onTick,
  };

  return <MetronomeContext.Provider value={contextValue}>{children}</MetronomeContext.Provider>;
};

// Custom hook for using the metronome context
export const useMetronome = (): MetronomeContextType => {
  const context = useContext(MetronomeContext);
  if (!context) {
    throw new Error('useMetronome must be used within a MetronomeProvider');
  }
  return context;
};
