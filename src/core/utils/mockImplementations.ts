/**
 * Mock implementations of core interfaces for testing
 */
import {
  IMetronomeEngine,
  IOutputSource,
  ITickEvent,
  MetronomeConfig,
  TimeSignature,
  SubdivisionType,
  OutputSourceConfig,
  OutputSourceType,
  MetronomeEventType,
} from '../interfaces';

/**
 * Mock implementation of ITickEvent for testing
 */
export class MockTickEvent implements ITickEvent {
  type: MetronomeEventType = 'beat';
  timestamp = Date.now();
  beatNumber = 1;
  measureNumber = 1;
  tempo = 120;
  timeSignature = { beats: 4, noteValue: 4 };
  subdivision = 'quarter' as SubdivisionType;
  isAccented = false;
  beatDuration = 500;
  nextTickTime = Date.now() + 500;
}

/**
 * Mock implementation of IOutputSource for testing
 */
export class MockOutputSource implements IOutputSource {
  readonly id: string;
  readonly type: OutputSourceType;
  private _isInitialized = false;
  private _isEnabled = true;
  private errorHandler: ((error: Error) => void) | null = null;
  private stateHandler: ((enabled: boolean) => void) | null = null;

  constructor(id: string, type: OutputSourceType = 'audio') {
    this.id = id;
    this.type = type;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  async initialize(config: OutputSourceConfig): Promise<void> {
    this._isInitialized = true;
    this._isEnabled = config.enabled ?? true;
  }

  async dispose(): Promise<void> {
    this._isInitialized = false;
  }

  async processTick(_event: ITickEvent): Promise<void> {
    if (!this._isEnabled) return;
    // Mock processing
  }

  async updateConfig(_config: MetronomeConfig): Promise<void> {
    // Mock config update
  }

  setEnabled(enabled: boolean): void {
    this._isEnabled = enabled;
    this.stateHandler?.(enabled);
  }

  async prepareNextTick(_time: number): Promise<void> {
    // Mock preparation
  }

  handleError(error: Error): void {
    this.errorHandler?.(error);
  }

  async reset(): Promise<void> {
    this._isEnabled = true;
  }

  getConfig(): OutputSourceConfig {
    return {
      id: this.id,
      type: this.type,
      enabled: this._isEnabled,
    };
  }

  onError(handler: (error: Error) => void): () => void {
    this.errorHandler = handler;
    return () => {
      this.errorHandler = null;
    };
  }

  onStateChange(handler: (enabled: boolean) => void): () => void {
    this.stateHandler = handler;
    return () => {
      this.stateHandler = null;
    };
  }
}

/**
 * Mock implementation of IMetronomeEngine for testing
 */
export class MockMetronomeEngine implements IMetronomeEngine {
  private config: MetronomeConfig = {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
  };
  private playing = false;
  private tickCallback: ((event: ITickEvent) => void) | null = null;

  async initialize(config: MetronomeConfig): Promise<void> {
    this.config = { ...config };
  }

  async dispose(): Promise<void> {
    this.playing = false;
    this.tickCallback = null;
  }

  async start(): Promise<void> {
    this.playing = true;
  }

  async stop(): Promise<void> {
    this.playing = false;
  }

  async scheduleNextTick(_time: number): Promise<ITickEvent> {
    return new MockTickEvent();
  }

  setTempo(bpm: number): void {
    this.config.tempo = bpm;
  }

  setTimeSignature(timeSignature: TimeSignature): void {
    this.config.timeSignature = timeSignature;
  }

  setSubdivision(subdivision: SubdivisionType): void {
    this.config.subdivision = subdivision;
  }

  setAccents(accents: boolean[]): void {
    this.config.accents = accents;
  }

  setVolume(volume: number): void {
    this.config.volume = volume;
  }

  setMuted(muted: boolean): void {
    this.config.muted = muted;
  }

  onTick(callback: (event: ITickEvent) => void): () => void {
    this.tickCallback = callback;
    return () => {
      this.tickCallback = null;
    };
  }

  getCurrentState(): MetronomeConfig {
    return { ...this.config };
  }

  getBeatDuration(): number {
    return 60000 / this.config.tempo;
  }

  isPlaying(): boolean {
    return this.playing;
  }
}
