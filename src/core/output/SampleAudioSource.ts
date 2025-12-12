import { logger } from '../../utils/logger';
import { OutputSourceConfig } from '../interfaces/IOutputSource';
import { ITickEvent } from '../interfaces/ITickEvent';
import { MetronomeConfig } from '../types/MetronomeTypes';
import { getSoundById } from '../types/SoundTypes';

import { BaseOutputSource } from './BaseOutputSource';

interface SampleAudioConfig {
  volume?: number;
  muted?: boolean;
  soundId?: string;
}

/**
 * Audio output source implementation for playing pre-recorded samples.
 * Handles loading, caching, and playing audio samples with precise timing.
 */
export class SampleAudioSource extends BaseOutputSource {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sampleBuffers: Map<string, AudioBuffer> = new Map();
  private currentSoundId: string = 'metronome-quartz';
  private isLoading: boolean = false;
  private audioConfig: SampleAudioConfig;
  private isMobile: boolean = false;

  constructor(config: OutputSourceConfig) {
    super({ ...config, type: 'sample' });
    this.audioConfig = {
      volume: 1.0,
      muted: false,
      soundId: 'metronome-quartz',
      ...(config.options as SampleAudioConfig),
    };

    // Detect mobile device for optimization
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  protected async initializeImpl(_config: OutputSourceConfig): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new AudioContext();

      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);

      // Set initial volume and mute state
      this.setVolume(this.audioConfig.volume || 1.0);
      this.setMuted(this.audioConfig.muted || false);

      // Set initial sound
      if (this.audioConfig.soundId) {
        await this.setSound(this.audioConfig.soundId);
      }

      // Log latency information
      const baseLatency = this.audioContext.baseLatency || 0;
      const outputLatency =
        (this.audioContext as AudioContext & { outputLatency?: number }).outputLatency || 0;
      const totalLatency = baseLatency + outputLatency;

      logger.info(
        `Sample Audio latency: ${totalLatency * 1000}ms (base: ${baseLatency * 1000}ms, output: ${outputLatency * 1000}ms)`
      );

      if (totalLatency > 0.02) {
        // 20ms threshold
        logger.warn(`High audio latency detected: ${totalLatency * 1000}ms`);
      }
    } catch (error) {
      logger.error('Error initializing SampleAudioSource:', error);
      throw error;
    }
  }

  /**
   * Set the current sound to use for playback
   * @param soundId ID of the sound to use
   */
  async setSound(soundId: string): Promise<void> {
    try {
      this.isLoading = true;

      const sound = getSoundById(soundId);
      if (!sound || sound.type !== 'sample') {
        throw new Error(`Invalid sample sound ID: ${soundId}`);
      }

      if (!sound.highSample || !sound.lowSample) {
        throw new Error(`Sample sound ${soundId} is missing sample paths`);
      }

      // Initialize audio context if it doesn't exist
      if (!this.audioContext) {
        logger.debug('Creating new AudioContext');
        this.audioContext = new AudioContext();

        // Create gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);

        // Set initial volume and mute state
        this.setVolume(this.audioConfig.volume || 1.0);
        this.setMuted(this.audioConfig.muted || false);
      }

      // Load the samples if they're not already cached
      if (!this.sampleBuffers.has(sound.highSample)) {
        const highBuffer = await this.loadSample(sound.highSample);
        this.sampleBuffers.set(sound.highSample, highBuffer);
      }

      if (!this.sampleBuffers.has(sound.lowSample)) {
        const lowBuffer = await this.loadSample(sound.lowSample);
        this.sampleBuffers.set(sound.lowSample, lowBuffer);
      }

      this.currentSoundId = soundId;
      this.audioConfig.soundId = soundId;
      logger.info(`Successfully set sound to ${soundId}`);
    } catch (error) {
      logger.error('Error setting sound:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load an audio sample from a URL
   * @param url URL of the sample to load
   * @returns AudioBuffer containing the decoded audio data
   */
  private async loadSample(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load sample: ${url}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Apply mobile optimization if needed
      return this.isMobile ? this.optimizeBufferForMobile(audioBuffer) : audioBuffer;
    } catch (error) {
      console.error(`Error loading sample ${url}:`, error);
      throw error;
    }
  }

  /**
   * Optimize an audio buffer for mobile devices by reducing its size
   * @param buffer Original audio buffer
   * @returns Optimized audio buffer
   */
  private optimizeBufferForMobile(buffer: AudioBuffer): AudioBuffer {
    if (!this.audioContext) {
      return buffer;
    }

    // For mobile, we can use a lower sample rate or shorter duration if needed
    // This is a simple implementation that just returns the original buffer
    // In a more advanced implementation, we could downsample or trim the buffer

    return buffer;
  }

  /**
   * Get the loading status of the audio samples
   * @returns True if samples are currently being loaded
   */
  getLoadingStatus(): boolean {
    return this.isLoading;
  }

  /**
   * Preload all samples for the current sound
   */
  async preloadSamples(): Promise<void> {
    const sound = getSoundById(this.currentSoundId);
    if (!sound || sound.type !== 'sample') {
      return;
    }

    try {
      this.isLoading = true;

      if (sound.highSample && !this.sampleBuffers.has(sound.highSample)) {
        const highBuffer = await this.loadSample(sound.highSample);
        this.sampleBuffers.set(sound.highSample, highBuffer);
      }

      if (sound.lowSample && !this.sampleBuffers.has(sound.lowSample)) {
        const lowBuffer = await this.loadSample(sound.lowSample);
        this.sampleBuffers.set(sound.lowSample, lowBuffer);
      }
    } finally {
      this.isLoading = false;
    }
  }

  protected async disposeImpl(): Promise<void> {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.gainNode = null;
    this.sampleBuffers.clear();
  }

  protected async processTickImpl(event: ITickEvent): Promise<void> {
    if (!this.audioContext || !this.gainNode || !this._isEnabled) {
      logger.debug('Skipping tick - audioContext, gainNode, or enabled state issue');
      return;
    }

    // Resume audio context if it's suspended
    if (this.audioContext.state === 'suspended') {
      logger.debug('Resuming suspended audio context');
      await this.audioContext.resume();
    }

    logger.debug(
      `Processing tick with sound ID: ${this.currentSoundId}, isAccented: ${event.isAccented}`
    );

    // Play the click
    this.playClick(event.timestamp, event.isAccented);
  }

  /**
   * Plays a sample at the specified time
   * @param time Time to play the sample
   * @param isAccented Whether to play the accented (high) sample
   */
  private playClick(time: number, isAccented: boolean): void {
    logger.debug(
      `playClick called with time=${time}, isAccented=${isAccented}, enabled=${this._isEnabled}`
    );

    if (!this.audioContext || !this.gainNode) {
      logger.warn('Cannot play click - audioContext or gainNode is null');
      return;
    }

    if (this.audioConfig.muted) {
      logger.debug('Cannot play click - audio is muted');
      return;
    }

    const sound = getSoundById(this.currentSoundId);
    if (!sound) {
      logger.warn(`Cannot play click - sound ID ${this.currentSoundId} not found`);
      return;
    }

    if (sound.type !== 'sample') {
      logger.warn(`Cannot play click - sound type is not 'sample'`);
      return;
    }

    // Determine which sample to play
    const samplePath = isAccented ? sound.highSample : sound.lowSample;
    if (!samplePath) {
      logger.warn('Cannot play click - sample path is missing');
      return;
    }

    // Get the buffer from cache
    const buffer = this.sampleBuffers.get(samplePath);
    if (!buffer) {
      logger.warn(`Cannot play click - buffer not found for path: ${samplePath}`);
      return;
    }

    logger.debug(
      `Playing ${isAccented ? 'accented' : 'regular'} click with sound: ${this.currentSoundId}, path: ${samplePath}, buffer duration: ${buffer.duration}s`
    );

    try {
      // Create buffer source
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.gainNode);

      // Schedule the click
      const currentTime = this.audioContext.currentTime;
      const scheduledTime = Math.max(currentTime, time);

      logger.debug(
        `Scheduling click at time=${scheduledTime} (current=${currentTime}, requested=${time})`
      );

      source.start(scheduledTime);

      // Add an event listener to confirm the sound played
      source.onended = () => {
        logger.debug(`Sound finished playing: ${this.currentSoundId}`);
      };
    } catch (error) {
      logger.error('Error playing click:', error);
    }
  }

  protected async updateConfigImpl(config: MetronomeConfig): Promise<void> {
    // Update volume if provided
    if (typeof config.volume === 'number') {
      this.setVolume(config.volume);
    }

    // Update mute state if provided
    if (typeof config.muted === 'boolean') {
      this.setMuted(config.muted);
    }
  }

  /**
   * Set the volume level (0.0 to 1.0)
   */
  private setVolume(volume: number): void {
    if (!this.gainNode) return;

    // Clamp volume to valid range
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audioConfig.volume = clampedVolume;

    // Only update gain if not muted
    if (!this.audioConfig.muted) {
      this.gainNode.gain.value = clampedVolume;
    }
  }

  /**
   * Set the muted state
   */
  private setMuted(muted: boolean): void {
    if (!this.gainNode) return;

    this.audioConfig.muted = muted;

    // Set gain to 0 if muted, otherwise to current volume
    this.gainNode.gain.value = muted ? 0 : this.audioConfig.volume || 0;
  }

  /**
   * Get the current volume level (0.0 to 1.0)
   */
  getVolume(): number {
    return this.audioConfig.volume || 0;
  }

  /**
   * Get the current muted state
   */
  isMuted(): boolean {
    return this.audioConfig.muted || false;
  }

  /**
   * Get the current sound ID
   */
  getCurrentSoundId(): string {
    return this.currentSoundId;
  }
}
