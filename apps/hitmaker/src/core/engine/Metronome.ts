/**
 * Metronome engine using Web Audio API
 * Designed for high precision timing with jitter ≤0.5ms
 * Supports tempo range: 30-500 BPM
 */

import { logger } from '../../utils/logger';
import { IOutputSource } from '../interfaces/IOutputSource';
import { ITickEvent } from '../interfaces/ITickEvent';
import { OutputSourceRegistry } from '../output/OutputSourceRegistry';

export interface MetronomeConfig {
  tempo: number;
  timeSignature: { beats: number; noteValue: number };
  subdivision: 'quarter' | 'eighth';
  accents: boolean[];
  volume: number;
  muted: boolean;
}

export interface TickEvent {
  type: 'beat';
  timestamp: number;
  beatNumber: number;
  measureNumber: number;
  tempo: number;
  timeSignature: { beats: number; noteValue: number };
  subdivision: 'quarter' | 'eighth';
  isAccented: boolean;
  beatDuration: number;
  nextTickTime: number;
}

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

  private config: MetronomeConfig = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    subdivision: 'quarter',
    accents: [true, false, false, false],
    volume: 1.0,
    muted: false,
  };

  private tickCallbacks: Set<(event: TickEvent) => void> = new Set();
  private errorHandlers: Set<(error: Error) => void> = new Set();

  constructor() {
    // Initialize properties only
    this.outputRegistry = OutputSourceRegistry.getInstance();
  }

  /**
   * Initializes the metronome with the provided configuration
   */
  async initialize(config: MetronomeConfig): Promise<void> {
    try {
      // Update configuration
      this.config = { ...config };

      // Create audio context for timing purposes
      this.audioContext = new AudioContext();

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
      const baseLatency = this.audioContext.baseLatency || 0;
      const outputLatency =
        (this.audioContext as AudioContext & { outputLatency?: number }).outputLatency || 0;
      const totalLatency = baseLatency + outputLatency;

      logger.info(
        `Audio latency: ${totalLatency * 1000}ms (base: ${baseLatency * 1000}ms, output: ${outputLatency * 1000}ms)`
      );

      if (totalLatency > 0.02) {
        // 20ms threshold
        logger.warn(`High audio latency detected: ${totalLatency * 1000}ms`);
      }
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

    // Determine if this beat should be accented
    const isAccented = this.config.accents[this.currentBeat] || false;

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
      isAccented,
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
        callback(tickEvent as TickEvent);
      } catch (error) {
        logger.error('Error in tick callback:', error);
      }
    });

    // Save last tick time
    this.lastTickTime = time;

    // If subdivision is eighth, schedule the eighth note tick
    if (this.config.subdivision === 'eighth') {
      const eighthTime = time + this.getBeatDuration() / 2000; // Half a beat later

      // Create subdivision tick event
      const subdivisionEvent: ITickEvent = {
        type: 'beat',
        timestamp: eighthTime,
        beatNumber: this.currentBeat + 1.5, // Fractional beat number for subdivision
        measureNumber: this.currentMeasure,
        tempo: this.config.tempo,
        timeSignature: { ...this.config.timeSignature },
        subdivision: this.config.subdivision,
        isAccented: false, // Subdivisions are never accented
        beatDuration,
        nextTickTime: time + 60 / this.config.tempo,
      };

      // Process subdivision tick on the active audio source (same as main beats)
      // Get the active audio source from the registry for subdivision
      const activeSourceForSubdivision = this.outputRegistry.getActiveSource();

      // Process subdivision tick on the active audio source
      if (activeSourceForSubdivision) {
        logger.debug(
          `Processing subdivision tick with ACTIVE audio source type: ${activeSourceForSubdivision.type}, ID: ${activeSourceForSubdivision.id}, enabled: ${activeSourceForSubdivision.isEnabled}`
        );
        activeSourceForSubdivision.processTick(subdivisionEvent).catch(error => {
          console.error('Error processing subdivision tick:', error);
          this.notifyError(error);
        });
      } else if (this.audioSource) {
        // Fall back to the original audio source if no active source is set
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

      // Notify listeners of subdivision tick
      this.tickCallbacks.forEach(callback => {
        try {
          callback(subdivisionEvent as TickEvent);
        } catch (error) {
          logger.error('Error in subdivision tick callback:', error);
        }
      });
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
    this.config.tempo = clampedBpm;
  }

  /**
   * Sets the time signature
   */
  setTimeSignature(timeSignature: { beats: number; noteValue: number }): void {
    this.config.timeSignature = timeSignature;
    this.currentBeat = 0; // Reset beat counter on time signature change
  }

  /**
   * Sets the subdivision type
   */
  setSubdivision(subdivision: 'quarter' | 'eighth'): void {
    this.config.subdivision = subdivision;
  }

  /**
   * Sets the accent pattern
   */
  setAccents(accents: boolean[]): void {
    this.config.accents = accents;
  }

  /**
   * Sets the volume level (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    // Clamp volume to valid range
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.config.volume = clampedVolume;

    // Update config on audio sources
    this.outputRegistry.updateConfig(this.config).catch(error => {
      logger.error('Error updating volume:', error);
      this.notifyError(error);
    });
  }

  /**
   * Sets the muted state
   */
  setMuted(muted: boolean): void {
    this.config.muted = muted;

    // Update config on audio sources
    this.outputRegistry.updateConfig(this.config).catch(error => {
      logger.error('Error updating mute state:', error);
      this.notifyError(error);
    });
  }

  /**
   * Registers a callback for tick events
   */
  onTick(callback: (event: TickEvent) => void): () => void {
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
    await this.stop();

    // Dispose of audio sources
    if (this.audioSource) {
      await this.outputRegistry.removeSource('primary-audio');
    }

    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    // Clear callbacks
    this.tickCallbacks.clear();
    this.errorHandlers.clear();
  }
}
