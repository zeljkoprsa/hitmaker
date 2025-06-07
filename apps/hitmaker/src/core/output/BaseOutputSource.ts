import { IOutputSource, OutputSourceConfig, OutputSourceType } from '../interfaces/IOutputSource';
import { ITickEvent } from '../interfaces/ITickEvent';
import { MetronomeConfig } from '../types/MetronomeTypes';

/**
 * Abstract base class for metronome output sources.
 * Implements common functionality and state management for all output types.
 */
export abstract class BaseOutputSource implements IOutputSource {
  protected _id: string;
  protected _type: OutputSourceType;
  protected _isInitialized: boolean = false;
  protected _isEnabled: boolean = false;
  protected _config: OutputSourceConfig;

  private _errorHandlers: Set<(error: Error) => void> = new Set();
  private _stateChangeHandlers: Set<(enabled: boolean) => void> = new Set();

  constructor(config: OutputSourceConfig) {
    this._id = config.id;
    this._type = config.type;
    this._config = config;
    this._isEnabled = config.enabled ?? false;
  }

  get id(): string {
    return this._id;
  }

  get type(): OutputSourceType {
    return this._type;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Initialize the output source with configuration.
   * Subclasses should override this method to perform their specific initialization.
   */
  async initialize(config: OutputSourceConfig): Promise<void> {
    if (this._isInitialized) {
      throw new Error(`Output source ${this._id} is already initialized`);
    }

    try {
      await this.initializeImpl(config);
      this._isInitialized = true;
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Implementation-specific initialization logic.
   * Subclasses must implement this method.
   */
  protected abstract initializeImpl(config: OutputSourceConfig): Promise<void>;

  /**
   * Clean up resources and remove event listeners.
   * Subclasses should override this to perform their specific cleanup.
   */
  async dispose(): Promise<void> {
    if (!this._isInitialized) {
      return;
    }

    try {
      await this.disposeImpl();
      this._isInitialized = false;
      this._errorHandlers.clear();
      this._stateChangeHandlers.clear();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Implementation-specific disposal logic.
   * Subclasses must implement this method.
   */
  protected abstract disposeImpl(): Promise<void>;

  /**
   * Process a tick event.
   * Subclasses must implement the actual tick processing logic.
   */
  async processTick(event: ITickEvent): Promise<void> {
    if (!this._isInitialized) {
      throw new Error(`Output source ${this._id} is not initialized`);
    }

    if (!this._isEnabled) {
      return;
    }

    try {
      await this.processTickImpl(event);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Implementation-specific tick processing logic.
   * Subclasses must implement this method.
   */
  protected abstract processTickImpl(event: ITickEvent): Promise<void>;

  /**
   * Update output source configuration based on metronome settings.
   * Subclasses should override this to handle specific configuration updates.
   */
  async updateConfig(config: MetronomeConfig): Promise<void> {
    if (!this._isInitialized) {
      throw new Error(`Output source ${this._id} is not initialized`);
    }

    try {
      await this.updateConfigImpl(config);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Implementation-specific configuration update logic.
   * Subclasses must implement this method.
   */
  protected abstract updateConfigImpl(config: MetronomeConfig): Promise<void>;

  /**
   * Enable or disable the output source.
   */
  setEnabled(enabled: boolean): void {
    if (this._isEnabled === enabled) {
      return;
    }

    this._isEnabled = enabled;
    this.notifyStateChange(enabled);
  }

  /**
   * Prepare for the next tick.
   * Subclasses should override this if they need to perform preparation.
   */
  async prepareNextTick(time: number): Promise<void> {
    if (!this._isInitialized) {
      throw new Error(`Output source ${this._id} is not initialized`);
    }

    if (!this._isEnabled) {
      return;
    }

    try {
      await this.prepareNextTickImpl(time);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Implementation-specific next tick preparation logic.
   * Subclasses can override this method if needed.
   */
  protected async prepareNextTickImpl(_time: number): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Handle errors that occur during output processing.
   */
  handleError(error: Error): void {
    this._errorHandlers.forEach(handler => handler(error));
  }

  /**
   * Reset the output source to its initial state.
   * Subclasses should override this to perform specific reset logic.
   */
  async reset(): Promise<void> {
    if (!this._isInitialized) {
      return;
    }

    try {
      await this.resetImpl();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Implementation-specific reset logic.
   * Subclasses can override this method if needed.
   */
  protected async resetImpl(): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Get the current configuration of the output source.
   */
  getConfig(): OutputSourceConfig {
    return { ...this._config };
  }

  /**
   * Register an error handler callback.
   */
  onError(handler: (error: Error) => void): () => void {
    this._errorHandlers.add(handler);
    return () => {
      this._errorHandlers.delete(handler);
    };
  }

  /**
   * Register a state change callback.
   */
  onStateChange(handler: (enabled: boolean) => void): () => void {
    this._stateChangeHandlers.add(handler);
    return () => {
      this._stateChangeHandlers.delete(handler);
    };
  }

  /**
   * Notify all registered handlers of a state change.
   */
  protected notifyStateChange(enabled: boolean): void {
    this._stateChangeHandlers.forEach(handler => handler(enabled));
  }
}
