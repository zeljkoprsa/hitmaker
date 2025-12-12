import { EventEmitter } from 'events';

import React, { createContext, useState, useRef, useContext, useEffect, useCallback } from 'react';

import { Metronome, TickEvent } from '../../../core/engine/Metronome';
import { OutputSourceRegistry } from '../../../core/output/OutputSourceRegistry';
import { SampleAudioSource } from '../../../core/output/SampleAudioSource';
import { getSoundById } from '../../../core/types/SoundTypes';
import { logger } from '../../../utils/logger';
import { TimeSignature, Subdivision } from '../types';

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
  subdivision: Subdivision;
  accents: boolean[];
  volume: number;
  muted: boolean;
  soundId: string;
  isLoadingSound: boolean;
  togglePlay: () => Promise<void>;
  setTempo: (bpm: number) => void;
  setTimeSignature: (timeSignature: TimeSignature) => void;
  setSubdivision: (subdivision: Subdivision) => void;
  setAccents: (accents: boolean[]) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setSound: (soundId: string) => Promise<void>;
  onTick: (callback: (event: TickEvent) => void) => () => void;
}

// Create the context with default values
const MetronomeContext = createContext<MetronomeContextType | null>(null);

// Map UI subdivision values to engine subdivision types
const subdivisionMap: Partial<Record<Subdivision, 'quarter' | 'eighth'>> = {
  '1': 'quarter',
  '2': 'eighth',
};

// Provider component
export const MetronomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a ref for the metronome instance
  const metronomeRef = useRef<Metronome | null>(null);
  const emitterRef = useRef<EventEmitter>(new EventEmitter());
  const outputRegistryRef = useRef<OutputSourceRegistry | null>(null);

  // State for UI
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempoState] = useState(120);
  const [timeSignature, setTimeSignatureState] = useState<TimeSignature>({
    beats: 4,
    value: 4,
  });
  const [subdivision, setSubdivisionState] = useState<Subdivision>('1');
  const [accents, setAccentsState] = useState<boolean[]>([true, false, false, false]);
  const [volume, setVolumeState] = useState(1.0);
  const [muted, setMutedState] = useState(false);
  const [soundId, setSoundIdState] = useState(() => {
    // Try to load from localStorage or use default
    const savedSound = localStorage.getItem('metrodome-sound-preference');
    return savedSound || 'metronome-quartz';
  });
  const [isLoadingSound, setIsLoadingSound] = useState(false);

  // Initialize the metronome only once when the component mounts
  useEffect(() => {
    const initMetronome = async () => {
      try {
        // Create new metronome instance
        const metronome = new Metronome();

        // Get the output registry
        const outputRegistry = OutputSourceRegistry.getInstance();
        outputRegistryRef.current = outputRegistry;

        // Initialize with initial config values
        await metronome.initialize({
          tempo,
          timeSignature: {
            beats: timeSignature.beats,
            noteValue: timeSignature.value,
          },
          subdivision: subdivisionMap[subdivision] || 'quarter',
          accents,
          volume,
          muted,
        });

        // Store in ref
        metronomeRef.current = metronome;

        // Set up tick event handler
        metronome.onTick(event => {
          emitterRef.current.emit('tick', event);
        });

        // Set up error handler
        metronome.onError(error => {
          logger.error('Metronome error:', error);
        });

        // Initialize sound selection
        await initializeSound(soundId);
      } catch (error) {
        logger.error('Failed to initialize metronome:', error);
      }
    };

    // Helper function to initialize sound
    const initializeSound = async (initialSoundId: string) => {
      try {
        setIsLoadingSound(true);
        const registry = outputRegistryRef.current;
        if (!registry) return;

        const sound = getSoundById(initialSoundId);
        if (!sound) return;

        // Check if a sample source already exists
        let sampleSource = registry.getSource('sample') as SampleAudioSource;

        if (!sampleSource) {
          logger.debug('Creating new SampleAudioSource during initialization');
          // Create and initialize SampleAudioSource only if it doesn't exist
          sampleSource = new SampleAudioSource({
            id: 'sample',
            type: 'sample',
            enabled: true,
            options: {
              volume,
              muted,
              soundId: initialSoundId,
            },
          });

          // Initialize the SampleAudioSource before registering it
          await sampleSource.initialize({
            id: 'sample',
            type: 'sample',
            enabled: true,
            options: {
              volume,
              muted,
              soundId: initialSoundId,
            },
          });

          await registry.createSource('sample', sampleSource);
        } else {
          logger.debug('Using existing SampleAudioSource during initialization');
        }

        // Set the sound and make it active regardless of whether it's new or existing
        await sampleSource.setSound(initialSoundId);
        registry.setActiveSource('sample');
      } catch (error) {
        console.error('Error initializing sound:', error);
      } finally {
        setIsLoadingSound(false);
      }
    };

    initMetronome();

    // Cleanup on unmount
    return () => {
      const metronome = metronomeRef.current;
      if (metronome) {
        metronome.dispose().catch(error => {
          console.error('Error disposing metronome:', error);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to create the metronome only once

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    const metronome = metronomeRef.current;
    if (!metronome) return;

    try {
      if (isPlaying) {
        await metronome.stop();
        setIsPlaying(false);
      } else {
        await metronome.start();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [isPlaying]);

  // Set tempo
  const setTempo = useCallback((bpm: number) => {
    const metronome = metronomeRef.current;
    if (!metronome) return;

    metronome.setTempo(bpm);
    setTempoState(bpm);
  }, []);

  // Set time signature
  const setTimeSignature = useCallback(
    (newTimeSignature: TimeSignature) => {
      const metronome = metronomeRef.current;
      if (!metronome) return;

      // Convert UI TimeSignature to engine TimeSignature
      const engineTimeSignature = {
        beats: newTimeSignature.beats,
        noteValue: newTimeSignature.value,
      };

      metronome.setTimeSignature(engineTimeSignature);
      setTimeSignatureState(newTimeSignature);

      // Update accents array if needed
      if (newTimeSignature.beats !== accents.length) {
        const newAccents = Array(newTimeSignature.beats).fill(false);
        newAccents[0] = true; // First beat is accented by default
        metronome.setAccents(newAccents);
        setAccentsState(newAccents);
      }
    },
    [accents]
  );

  // Set subdivision
  const setSubdivision = useCallback((newSubdivision: Subdivision) => {
    const metronome = metronomeRef.current;
    if (!metronome) return;

    // Use quarter as fallback if subdivision not found in map
    metronome.setSubdivision(subdivisionMap[newSubdivision] || 'quarter');
    setSubdivisionState(newSubdivision);
  }, []);

  // Set accents
  const setAccents = useCallback((newAccents: boolean[]) => {
    const metronome = metronomeRef.current;
    if (!metronome) return;

    metronome.setAccents(newAccents);
    setAccentsState(newAccents);
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const metronome = metronomeRef.current;
    if (!metronome) return;

    metronome.setVolume(newVolume);
    setVolumeState(newVolume);
  }, []);

  // Set muted
  const setMuted = useCallback((newMuted: boolean) => {
    const metronome = metronomeRef.current;
    if (!metronome) return;

    metronome.setMuted(newMuted);
    setMutedState(newMuted);
  }, []);

  // Set sound
  const setSound = useCallback(
    async (newSoundId: string) => {
      logger.info(`Setting sound to ${newSoundId}`);
      try {
        setIsLoadingSound(true);
        const registry = outputRegistryRef.current;
        if (!registry) {
          logger.error('Output registry is null');
          return;
        }

        const sound = getSoundById(newSoundId);
        if (!sound) {
          logger.error(`Sound with ID ${newSoundId} not found`);
          return;
        }

        logger.debug('Using SampleAudioSource');

        // Get or create SampleAudioSource
        logger.debug('Using SampleAudioSource');
        let sampleSource = registry.getSource('sample') as SampleAudioSource;
        logger.debug(`Existing sample source: ${sampleSource ? 'found' : 'not found'}`);

        if (!sampleSource) {
          // Create new SampleAudioSource if it doesn't exist
          logger.debug('Creating new SampleAudioSource');
          sampleSource = new SampleAudioSource({
            id: 'sample',
            type: 'sample',
            enabled: true,
            options: {
              volume,
              muted,
              soundId: newSoundId,
            },
          });

          // Initialize the SampleAudioSource before registering it
          logger.debug('Initializing SampleAudioSource');
          await sampleSource.initialize({
            id: 'sample',
            type: 'sample',
            enabled: true,
            options: {
              volume,
              muted,
              soundId: newSoundId,
            },
          });

          await registry.createSource('sample', sampleSource);
          logger.debug('Created new SampleAudioSource');
        }

        // Set the new sound and activate the source
        logger.debug(`Setting sample sound to ${newSoundId}`);
        await sampleSource.setSound(newSoundId);
        logger.debug('Setting sample source as active');
        registry.setActiveSource('sample');

        // Update state and save preference
        logger.debug(`Updating state with sound ID ${newSoundId}`);
        setSoundIdState(newSoundId);
        localStorage.setItem('metrodome-sound-preference', newSoundId);
      } catch (error) {
        logger.error('Error setting sound:', error);
      } finally {
        setIsLoadingSound(false);
      }
    },
    [volume, muted]
  );

  // Register tick callback
  const onTick = useCallback((callback: (event: TickEvent) => void) => {
    const emitter = emitterRef.current;
    emitter.on('tick', callback);

    // Return cleanup function
    return () => {
      emitter.off('tick', callback);
    };
  }, []);

  // Context value
  const contextValue: MetronomeContextType = {
    isPlaying,
    tempo,
    timeSignature,
    subdivision,
    accents,
    volume,
    muted,
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
