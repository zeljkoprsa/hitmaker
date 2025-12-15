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

import { Metronome, TickEvent } from '../../../core/engine/Metronome';
import { OutputSourceRegistry } from '../../../core/output/OutputSourceRegistry';
import { SampleAudioSource } from '../../../core/output/SampleAudioSource';
import { TimeSignature, SubdivisionType } from '../../../core/types/MetronomeTypes';
import { getSoundById } from '../../../core/types/SoundTypes';
import { logger } from '../../../utils/logger';

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
  accents: boolean[];
  volume: number;
  muted: boolean;
  soundId: string;
  isLoadingSound: boolean;
  togglePlay: () => Promise<void>;
  setTempo: (bpm: number) => void;
  setTimeSignature: (timeSignature: TimeSignature) => void;
  setSubdivision: (subdivision: SubdivisionType) => void;
  setAccents: (accents: boolean[]) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setSound: (soundId: string) => Promise<void>;
  onTick: (callback: (event: TickEvent) => void) => () => void;
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
  console.log('[MetronomeProvider] Render with isPlaying:', state.isPlaying);

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
          metronome.start().catch(err => console.warn("Autoplay blocked:", err));
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
  const setAccents = useCallback((acc: boolean[]) => metronome.setAccents(acc), [metronome]);
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
  const onTick = useCallback((callback: (event: TickEvent) => void) => {
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
    accents: state.accents,
    volume: state.volume,
    muted: state.muted,
    soundId,
    isLoadingSound,
    togglePlay,
    setTempo,
    setTimeSignature,
    setSubdivision,
    setAccents,
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
