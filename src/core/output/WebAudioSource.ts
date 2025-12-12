import { OutputSourceConfig } from '../interfaces/IOutputSource';
import { ITickEvent } from '../interfaces/ITickEvent';
import { MetronomeConfig } from '../types/MetronomeTypes';

import { BaseOutputSource } from './BaseOutputSource';

interface WebAudioConfig {
  volume?: number;
  muted?: boolean;
  highClickFreq?: number;
  lowClickFreq?: number;
  clickDuration?: number;
}

/**
 * Audio output source implementation using Web Audio API.
 * Handles all audio-related functionality including click sounds and volume control.
 */
export class WebAudioSource extends BaseOutputSource {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private clickBuffer: AudioBuffer | null = null;
  private accentedClickBuffer: AudioBuffer | null = null;
  private audioConfig: WebAudioConfig;

  constructor(config: OutputSourceConfig) {
    super({ ...config, type: 'webAudio' });
    this.audioConfig = {
      volume: 1.0,
      muted: false,
      highClickFreq: 1000, // Hz for accented beats
      lowClickFreq: 800, // Hz for regular beats
      clickDuration: 0.05, // seconds
      ...(config.options as WebAudioConfig),
    };
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

      // Create click buffers
      this.clickBuffer = await this.makeClick(false);
      this.accentedClickBuffer = await this.makeClick(true);

      // Log latency information
      const baseLatency = this.audioContext.baseLatency || 0;
      const outputLatency =
        (this.audioContext as AudioContext & { outputLatency?: number }).outputLatency || 0;
      const totalLatency = baseLatency + outputLatency;

      console.log(
        `Audio latency: ${totalLatency * 1000}ms (base: ${baseLatency * 1000}ms, output: ${outputLatency * 1000}ms)`
      );

      if (totalLatency > 0.02) {
        // 20ms threshold
        console.warn(`High audio latency detected: ${totalLatency * 1000}ms`);
      }
    } catch (error) {
      console.error('Error initializing WebAudioSource:', error);
      throw error;
    }
  }

  /**
   * Creates an audio buffer with a decaying click sound
   */
  private async makeClick(isAccented: boolean): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    // Increase duration for a more natural decay
    const duration = (this.audioConfig.clickDuration || 0.05) * 2.0; // 100ms click (50ms * 2.0)
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = duration * sampleRate;
    const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    // Use lower frequencies for a mellower sound
    const frequency = isAccented
      ? this.audioConfig.highClickFreq || 800 // Reduced from 1000
      : this.audioConfig.lowClickFreq || 600; // Reduced from 800

    // Use a much gentler decay rate
    const decayRate = isAccented ? 8 : 7; // Reduced from 12/10

    // Add a slightly longer attack phase
    const attackTime = 0.003; // 3ms attack

    // Use a bandpass filter approach for the click
    // This creates a more focused, less harsh sound
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;

      // Attack phase (quick but smooth ramp up)
      let attackEnv = 1.0;
      if (t < attackTime) {
        // Smoother attack curve (quadratic instead of linear)
        attackEnv = Math.pow(t / attackTime, 2);
      }

      // Create a more drum-like sound with multiple harmonics
      // but with careful amplitude control
      let wave = 0;

      // Fundamental frequency with highest amplitude
      wave += Math.sin(2 * Math.PI * frequency * t) * 0.7;

      // First harmonic - adds some brightness
      if (isAccented) {
        wave += Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.15;
      }

      // Lower frequency component - adds some body
      wave += Math.sin(2 * Math.PI * frequency * 0.5 * t) * 0.15;

      // Smoother exponential decay with extended tail
      let envelope;
      if (t < duration * 0.3) {
        // Initial decay - faster for a percussive attack
        envelope = Math.exp(-decayRate * 1.5 * t);
      } else if (t < duration * 0.8) {
        // Middle decay - gentler for body
        envelope = Math.exp(-decayRate * 0.8 * t);
      } else {
        // Final tail - very gentle cubic fade to zero
        const normalizedT = (t - duration * 0.8) / (duration * 0.2);
        const tailValue = Math.exp(-decayRate * 0.8 * duration * 0.8);
        envelope = tailValue * (1 - Math.pow(normalizedT, 3));
      }

      // Apply envelope with careful amplitude scaling
      // The 0.25 factor significantly reduces the amplitude to prevent clipping
      data[i] = wave * envelope * attackEnv * 0.25;
    }

    // Apply a final normalization pass to ensure no clipping
    // Find the maximum amplitude
    let maxAmplitude = 0;
    for (let i = 0; i < bufferSize; i++) {
      maxAmplitude = Math.max(maxAmplitude, Math.abs(data[i]));
    }

    // If the sound is clipping, normalize it
    if (maxAmplitude > 0.95) {
      const normalizationFactor = 0.9 / maxAmplitude; // Target 90% of maximum
      for (let i = 0; i < bufferSize; i++) {
        data[i] *= normalizationFactor;
      }
    }

    return buffer;
  }

  protected async disposeImpl(): Promise<void> {
    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
    this.gainNode = null;
    this.clickBuffer = null;
    this.accentedClickBuffer = null;
  }

  protected async processTickImpl(event: ITickEvent): Promise<void> {
    if (!this.audioContext || !this.gainNode || !this._isEnabled) {
      return;
    }

    // Resume audio context if it's suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Play the click
    this.playClick(event.timestamp, event.isAccented);
  }

  /**
   * Plays a click sound at the specified time
   */
  private playClick(time: number, isAccented: boolean): void {
    if (!this.audioContext || !this.gainNode || this.audioConfig.muted) return;

    // Choose the appropriate buffer
    const buffer = isAccented ? this.accentedClickBuffer : this.clickBuffer;
    if (!buffer) return;

    // Create buffer source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);

    // Schedule the click
    const currentTime = this.audioContext.currentTime;
    const scheduledTime = Math.max(currentTime, time);
    source.start(scheduledTime);
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
}
