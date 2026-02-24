/**
 * Metronome engine using Web Audio API
 * Designed for high precision timing with jitter ≤0.5ms
 * Supports tempo range: 30-500 BPM
 */

import { logger } from '../../utils/logger';
import { IOutputSource } from '../interfaces/IOutputSource';
import { ITickEvent } from '../interfaces/ITickEvent';
import { OutputSourceRegistry } from '../output/OutputSourceRegistry';
import {
  TimeSignature,
  SubdivisionType,
  MetronomeConfig,
  MetronomeState,
  AccentLevel,
} from '../types/MetronomeTypes';
import { getDefaultAccentPattern } from '../utils/timeSignatureUtils';
export type { MetronomeConfig, MetronomeState };

export class Metronome {
  private audioContext: AudioContext | null = null;
  private nextNoteTime: number = 0;
  private timerID: number | null = null;
  private currentBeat: number = 0;
  private currentMeasure: number = 1;
  private playing: boolean = false;
  private lookahead: number = 25.0; // milliseconds
  private scheduleAheadTime: number = 0.1; // seconds
  private lastTickTime: number = 0;

  // Audio output source registry
  private outputRegistry: OutputSourceRegistry;
  private audioSource: IOutputSource | null = null;

  private config: Required<MetronomeConfig> = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    subdivision: 'quarter',
    accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
    volume: 1.0,
    muted: false,
  };

  private tickCallbacks: Set<(event: ITickEvent) => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();
  private subscribers: Set<() => void> = new Set();

  constructor() {
    // Initialize properties only
    this.outputRegistry = OutputSourceRegistry.getInstance();
    logger.info('[Metronome] Constructor called');

    // Create audio context immediately if possible, but don't fail if we can't (browser policy)
    try {
      this.audioContext = new AudioContext();
      this.setupAudioContextListeners();
    } catch (e) {
      logger.warn('Could not create AudioContext in constructor:', e);
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private setupAudioContextListeners() {
    if (!this.audioContext) return;
    this.audioContext.onstatechange = () => {
      logger.info(`[Metronome] AudioContext state changed to: ${this.audioContext?.state}`);
      if (
        this.playing &&
        this.audioContext &&
        (this.audioContext.state === 'suspended' ||
          (this.audioContext.state as string) === 'interrupted')
      ) {
        // Try to automatically resume if we were playing
        this.audioContext
          .resume()
          .catch(e => logger.error('Could not auto-resume audio context:', e));
      }
    };
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'visible') {
      if (this.playing && this.audioContext) {
        // If the context got suspended by the OS, try to resume it
        if (
          this.audioContext.state === 'suspended' ||
          (this.audioContext.state as string) === 'interrupted'
        ) {
          this.audioContext
            .resume()
            .catch(e => logger.error('Could not resume audio context on visibility change', e));
        }

        // Reset the scheduling time to prevent scheduling a barrage of missed ticks
        const now = this.audioContext.currentTime;
        // Add a small buffer (e.g. 0.05s) so the next note plays immediately without overlapping the current time exactly
        if (this.nextNoteTime < now) {
          logger.info(
            `[Metronome] Resetting nextNoteTime after sleep/background. Was ${this.nextNoteTime}, now ${now}.`
          );
          this.nextNoteTime = now + 0.05;
        }
      }
    }
  };

  /**
   * Initializes the metronome with the provided configuration
   * @throws Error if initialization fails
   */
  async initialize(config: MetronomeConfig): Promise<void> {
    try {
      // Update configuration with defaults for missing values
      this.config = {
        tempo: config.tempo,
        timeSignature: config.timeSignature,
        subdivision: config.subdivision || 'quarter',
        accents: config.accents || [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
        volume: config.volume ?? 1.0,
        muted: config.muted ?? false,
      };

      // Create audio context for timing purposes
      if (!this.audioContext) {
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
            this.setupAudioContextListeners();
          } else {
            logger.error('Browser does not support Web Audio API');
          }
        } catch (e) {
          logger.error('Failed to create AudioContext during initialization:', e);
        }
      }

      // Initialize the WebAudioSource through the registry
      this.audioSource = await this.outputRegistry.createSource({
        id: 'primary-audio',
        type: 'webAudio',
        enabled: true, // Explicitly enable the audio source
        options: {
          volume: this.config.volume,
          muted: this.config.muted,
        },
      });

      // Register error handler
      this.audioSource.onError(error => this.notifyError(error));

      // Make sure the audio source is enabled
      this.audioSource.setEnabled(true);

      // Update configuration on the audio source
      await this.outputRegistry.updateConfig(this.config);

      // Log audio context information
      if (this.audioContext) {
        const baseLatency = this.audioContext.baseLatency || 0;
        const outputLatency =
          (this.audioContext as AudioContext & { outputLatency?: number }).outputLatency || 0;
        const totalLatency = baseLatency + outputLatency;

        const totalLatencyMs = totalLatency * 1000;
        const baseLatencyMs = baseLatency * 1000;
        const outputLatencyMs = outputLatency * 1000;

        logger.info(
          `Audio latency: ${totalLatencyMs}ms (base: ${baseLatencyMs}ms, output: ${outputLatencyMs}ms)`
        );

        if (totalLatency > 0.02) {
          // 20ms threshold
          logger.warn(`High audio latency detected: ${totalLatency * 1000}ms`);
        }
      }
      this.notifyChange();
    } catch (error) {
      logger.error('Error initializing Metronome:', error);
      this.notifyError(error as Error);
      throw error;
    }
  }

  /**
   * Schedules the next tick and advances the beat counter
   */
  private scheduler(): void {
    // If we're not playing or the audio context is null, don't schedule anything
    if (!this.playing || !this.audioContext) return;

    // While there are notes to be scheduled in our lookahead window
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleTick(this.nextNoteTime);
      this.advanceNote();
    }

    // Schedule the next scheduler call only if we're still playing
    if (this.playing) {
      this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }
  }

  /**
   * Schedules a tick at the specified time
   */
  private scheduleTick(time: number): void {
    if (!this.audioContext) return;

    // Determine accent level for this beat
    const accentLevel = this.config.accents[this.currentBeat] ?? AccentLevel.Normal;

    // Calculate beat duration in milliseconds
    const beatDuration = this.getBeatDuration();

    // Create tick event
    const tickEvent: ITickEvent = {
      type: 'beat',
      timestamp: time,
      beatNumber: this.currentBeat + 1, // 1-indexed for user display
      measureNumber: this.currentMeasure,
      tempo: this.config.tempo,
      timeSignature: { ...this.config.timeSignature },
      subdivision: this.config.subdivision,
      accentLevel,
      beatDuration,
      nextTickTime: time + 60 / this.config.tempo,
    };

    // Get the active audio source from the registry
    const activeSource = this.outputRegistry.getActiveSource();

    // Process tick on the active audio source
    if (activeSource) {
      logger.debug(
        `Processing tick with ACTIVE audio source type: ${activeSource.type}, ID: ${activeSource.id}, enabled: ${activeSource.isEnabled}`
      );
      activeSource.processTick(tickEvent).catch(error => {
        console.error('Error processing tick:', error);
        this.notifyError(error);
      });
    } else if (this.audioSource) {
      // Fall back to the original audio source if no active source is set
      logger.debug(
        `No active source found, falling back to original source type: ${this.audioSource.type}, ID: ${this.audioSource.id}, enabled: ${this.audioSource.isEnabled}`
      );
      this.audioSource.processTick(tickEvent).catch(error => {
        console.error('Error processing tick:', error);
        this.notifyError(error);
      });
    } else {
      logger.warn('No audio source available for tick');
    }

    // Notify listeners
    this.tickCallbacks.forEach(callback => {
      try {
        callback(tickEvent);
      } catch (error) {
        logger.error('Error in tick callback:', error);
      }
    });

    // Save last tick time
    this.lastTickTime = time;

    // Schedule subdivision ticks for eighth and sixteenth notes
    if (this.config.subdivision === 'eighth' || this.config.subdivision === 'sixteenth') {
      const beatDurationSec = this.getBeatDuration() / 1000;
      const offsets = this.config.subdivision === 'sixteenth' ? [0.25, 0.5, 0.75] : [0.5];
      const activeSourceForSubdivision = this.outputRegistry.getActiveSource();

      for (const fraction of offsets) {
        const subTime = time + beatDurationSec * fraction;

        const subdivisionEvent: ITickEvent = {
          type: 'beat',
          timestamp: subTime,
          beatNumber: this.currentBeat + 1.5, // Fractional beat number for subdivision
          measureNumber: this.currentMeasure,
          tempo: this.config.tempo,
          timeSignature: { ...this.config.timeSignature },
          subdivision: this.config.subdivision,
          accentLevel: AccentLevel.Normal,
          beatDuration,
          nextTickTime: time + 60 / this.config.tempo,
        };

        if (activeSourceForSubdivision) {
          logger.debug(
            `Processing subdivision tick with ACTIVE audio source type: ${activeSourceForSubdivision.type}, ID: ${activeSourceForSubdivision.id}, enabled: ${activeSourceForSubdivision.isEnabled}`
          );
          activeSourceForSubdivision.processTick(subdivisionEvent).catch(error => {
            console.error('Error processing subdivision tick:', error);
            this.notifyError(error);
          });
        } else if (this.audioSource) {
          logger.debug(
            `No active source found for subdivision, falling back to original source type: ${this.audioSource.type}, ID: ${this.audioSource.id}, enabled: ${this.audioSource.isEnabled}`
          );
          this.audioSource.processTick(subdivisionEvent).catch(error => {
            console.error('Error processing subdivision tick:', error);
            this.notifyError(error);
          });
        } else {
          logger.warn('No audio source available for subdivision tick');
        }

        this.tickCallbacks.forEach(callback => {
          try {
            callback(subdivisionEvent);
          } catch (error) {
            logger.error('Error in subdivision tick callback:', error);
          }
        });
      }
    }
  }

  /**
   * Advances the beat counter for the next note
   */
  private advanceNote(): void {
    // Calculate beat duration in seconds
    const secondsPerBeat = 60.0 / this.config.tempo;

    // Advance time by one beat
    this.nextNoteTime += secondsPerBeat;

    // Advance beat counter
    this.currentBeat = (this.currentBeat + 1) % this.config.timeSignature.beats;

    // Increment measure when we wrap around
    if (this.currentBeat === 0) {
      this.currentMeasure++;
    }
  }

  /**
   * Starts the metronome
   */
  async start(): Promise<void> {
    if (this.playing) return;

    try {
      if (!this.audioContext) {
        // Try to create AudioContext lazily (e.g. inside user gesture)
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
            this.setupAudioContextListeners();
          }
        } catch (e) {
          logger.warn('Failed to lazy-initialize AudioContext:', e);
        }
      }

      if (!this.audioContext) {
        throw new Error('Metronome not initialized');
      }

      // Resume audio context if it's suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Reset counters
      this.currentBeat = 0;
      this.currentMeasure = 1;

      // Start scheduling from now
      this.nextNoteTime = this.audioContext.currentTime;

      // Set playing to true before starting the scheduler
      this.playing = true;

      // Start the scheduler
      this.scheduler();

      this.notifyChange();
      logger.info('Metronome started');
    } catch (error) {
      logger.error('Error starting metronome:', error);
      this.notifyError(error as Error);
      this.playing = false; // Ensure playing is false if start fails
      throw error;
    }
  }

  /**
   * Stops the metronome
   */
  async stop(): Promise<void> {
    if (!this.playing) return;

    try {
      // Set playing to false first to prevent new scheduler calls
      this.playing = false;

      // Stop the scheduler
      if (this.timerID !== null) {
        clearTimeout(this.timerID);
        this.timerID = null;
      }

      // Reset the beat counter for next start
      this.currentBeat = 0;
      this.currentMeasure = 1;

      this.notifyChange();
      logger.info('Metronome stopped');
    } catch (error) {
      logger.error('Error stopping metronome:', error);
      this.notifyError(error as Error);
      throw error;
    }
  }

  /**
   * Sets the tempo in beats per minute
   */
  setTempo(bpm: number): void {
    // Clamp tempo to valid range
    const clampedBpm = Math.max(30, Math.min(500, bpm));
    // Skip update if value hasn't changed
    if (this.config.tempo === clampedBpm) return;
    this.config.tempo = clampedBpm;
    this.notifyChange();
  }

  /**
   * Sets the time signature
   */
  setTimeSignature(timeSignature: { beats: number; noteValue: number }): void {
    // Skip update if value hasn't changed
    if (
      this.config.timeSignature.beats === timeSignature.beats &&
      this.config.timeSignature.noteValue === timeSignature.noteValue
    ) {
      return;
    }

    this.config.timeSignature = timeSignature;
    this.currentBeat = 0; // Reset beat counter on time signature change

    // Use centralized default accent pattern logic
    this.config.accents = getDefaultAccentPattern(timeSignature.beats, timeSignature.noteValue);

    this.notifyChange();
  }

  setSubdivision(subdivision: SubdivisionType): void {
    // Skip update if value hasn't changed
    if (this.config.subdivision === subdivision) return;
    this.config.subdivision = subdivision;
    this.notifyChange();
  }

  /**
   * Sets the accent pattern
   */
  setAccents(accents: AccentLevel[]): void {
    // Skip update if array hasn't changed (deep equality check)
    if (
      this.config.accents.length === accents.length &&
      this.config.accents.every((level, index) => level === accents[index])
    ) {
      return;
    }
    this.config.accents = accents;
    this.notifyChange();
  }

  /**
   * Sets the volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    // Clamp volume to valid range
    const clampedVolume = Math.max(0, Math.min(1, volume));
    // Skip update if value hasn't changed
    if (this.config.volume === clampedVolume) return;
    this.config.volume = clampedVolume;

    // Update config on audio sources
    this.outputRegistry.updateConfig(this.config).catch(error => {
      logger.error('Error updating volume:', error);
      this.notifyError(error);
    });
    this.notifyChange();
  }

  /**
   * Sets the muted state
   */
  setMuted(muted: boolean): void {
    // Skip update if value hasn't changed
    if (this.config.muted === muted) return;
    this.config.muted = muted;

    // Update config on audio sources
    this.outputRegistry.updateConfig(this.config).catch(error => {
      logger.error('Error updating mute state:', error);
      this.notifyError(error);
    });
    this.notifyChange();
  }

  /**
   * Registers a callback for tick events
   */
  onTick(callback: (event: ITickEvent) => void): () => void {
    this.tickCallbacks.add(callback);
    return () => {
      this.tickCallbacks.delete(callback);
    };
  }

  /**
   * Registers a callback for error events
   */
  onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Notifies all error handlers of an error
   */
  private notifyError(error: Error): void {
    this.errorHandlers.forEach(handler => handler(error));
  }

  /**
   * Gets the current metronome configuration
   */
  getCurrentState(): MetronomeConfig {
    return { ...this.config };
  }

  /**
   * Gets the duration of one beat at the current tempo
   */
  getBeatDuration(): number {
    return (60 / this.config.tempo) * 1000; // Convert to milliseconds
  }

  /**
   * Checks if the metronome is currently playing
   */
  isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Cleans up resources
   */
  async dispose(): Promise<void> {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    await this.stop();

    // Dispose of audio sources
    if (this.audioSource) {
      await this.outputRegistry.removeSource('primary-audio');
    }

    // Close audio context
    if (this.audioContext) {
      this.audioContext.onstatechange = null;
      await this.audioContext.close();
      this.audioContext = null;
    }

    // Do not clear subscribers or callbacks manually here.
    // Consumers (hooks/components) are responsible for unsubscribing.
    // Clearing them here causes race conditions with React StrictMode where
    // the new subscription is wiped out by the previous cleanup's dispose call.
  }

  /**
   * Subscribes to state changes
   */
  /**
   * Subscribes to state changes
   */
  subscribe = (callback: () => void): (() => void) => {
    console.log('[Metronome] Subscribed. Total:', this.subscribers.size + 1);
    this.subscribers.add(callback);
    return () => {
      console.log('[Metronome] Unsubscribed. Total:', this.subscribers.size - 1);
      this.subscribers.delete(callback);
    };
  };

  /**
   * Cached snapshot to ensure reference stability for useSyncExternalStore
   */
  private currentSnapshot: MetronomeState | null = null;

  /**
   * Gets the current state snapshot
   * Returns a stable reference if state hasn't changed
   */
  getSnapshot = (): MetronomeState => {
    if (!this.currentSnapshot) {
      this.currentSnapshot = {
        ...this.config,
        isPlaying: this.playing,
      };
    }
    // logger.info('[Metronome] getSnapshot called', this.currentSnapshot);
    return this.currentSnapshot;
  };

  /**
   * Notifies subscribers of state changes
   * Updates the cached snapshot before notifying
   */
  private notifyChange(): void {
    // Update snapshot
    this.currentSnapshot = {
      ...this.config,
      isPlaying: this.playing,
    };
    console.log(`[Metronome] notifyChange. Subscribers: ${this.subscribers.size}`);
    // Notify subscribers
    this.subscribers.forEach(callback => callback());
  }
}
