import { logger } from '../../utils/logger';
import { IOutputSource, OutputSourceConfig, OutputSourceType } from '../interfaces/IOutputSource';
import { ITickEvent } from '../interfaces/ITickEvent';
import { MetronomeConfig } from '../types/MetronomeTypes';

import { SampleAudioSource } from './SampleAudioSource';
import { WebAudioSource } from './WebAudioSource';

export type OutputSourceFactory = (config: OutputSourceConfig) => Promise<IOutputSource>;

/**
 * Registry for managing metronome output sources.
 * Handles registration, initialization, and lifecycle management of different output types.
 */
export class OutputSourceRegistry {
  private static instance: OutputSourceRegistry;
  private sources: Map<string, IOutputSource> = new Map();
  private factories: Map<OutputSourceType, OutputSourceFactory> = new Map();
  private errorHandlers: Set<(error: Error) => void> = new Set();
  private activeSourceId: string | null = null;

  private constructor() {
    // Register built-in output source factories
    this.registerFactory('webAudio', async config => new WebAudioSource(config));
    this.registerFactory('sample', async config => new SampleAudioSource(config));
  }

  /**
   * Get the singleton instance of OutputSourceRegistry
   */
  public static getInstance(): OutputSourceRegistry {
    if (!OutputSourceRegistry.instance) {
      OutputSourceRegistry.instance = new OutputSourceRegistry();
    }
    return OutputSourceRegistry.instance;
  }

  /**
   * Register a factory function for creating output sources of a specific type
   */
  public registerFactory(type: OutputSourceType, factory: OutputSourceFactory): void {
    this.factories.set(type, factory);
  }

  /**
   * Create and initialize an output source
   */
  public async createSource(config: OutputSourceConfig): Promise<IOutputSource>;

  /**
   * Create and initialize an output source with a pre-created instance
   */
  public async createSource(id: string, source: IOutputSource): Promise<IOutputSource>;

  public async createSource(
    configOrId: OutputSourceConfig | string,
    existingSource?: IOutputSource
  ): Promise<IOutputSource> {
    // Handle the case where an existing source is provided
    if (typeof configOrId === 'string' && existingSource) {
      const id = configOrId;

      // Check if source with this ID already exists
      if (this.sources.has(id)) {
        throw new Error(`Output source with ID ${id} already exists`);
      }

      try {
        // Register error handler
        existingSource.onError(error => this.handleError(error));

        // Store the source
        this.sources.set(id, existingSource);

        return existingSource;
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    }

    // Handle the case where a config is provided
    const config = configOrId as OutputSourceConfig;

    // Check if source with this ID already exists
    if (this.sources.has(config.id)) {
      throw new Error(`Output source with ID ${config.id} already exists`);
    }

    // Get factory for this type
    const factory = this.factories.get(config.type);
    if (!factory) {
      throw new Error(`No factory registered for output type: ${config.type}`);
    }

    try {
      // Create and initialize the source
      const source = await factory(config);
      await source.initialize(config);

      // Register error handler
      source.onError(error => this.handleError(error));

      // Store the source
      this.sources.set(config.id, source);

      return source;
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get an output source by ID
   */
  public getSource(id: string): IOutputSource | undefined {
    return this.sources.get(id);
  }

  /**
   * Get the currently active output source
   * @returns The active output source, or undefined if none is active
   */
  public getActiveSource(): IOutputSource | undefined {
    if (!this.activeSourceId) {
      logger.debug('No active source set');
      return undefined;
    }

    const activeSource = this.sources.get(this.activeSourceId);
    if (!activeSource) {
      logger.warn(`Active source with ID ${this.activeSourceId} not found`);
      return undefined;
    }

    logger.debug(`Retrieved active source: ${activeSource.id} of type ${activeSource.type}`);
    return activeSource;
  }

  /**
   * Get all registered output sources
   */
  public getAllSources(): IOutputSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Remove and dispose of an output source
   */
  public async removeSource(id: string): Promise<void> {
    const source = this.sources.get(id);
    if (source) {
      await source.dispose();
      this.sources.delete(id);
    }
  }

  /**
   * Process a tick event on all enabled sources
   */
  public async processTick(event: ITickEvent): Promise<void> {
    const promises = Array.from(this.sources.values())
      .filter(source => source.isEnabled)
      .map(source => source.processTick(event));

    try {
      await Promise.all(promises);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Update configuration on all sources
   */
  public async updateConfig(config: MetronomeConfig): Promise<void> {
    const promises = Array.from(this.sources.values()).map(source => source.updateConfig(config));

    try {
      await Promise.all(promises);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Prepare all enabled sources for the next tick
   */
  public async prepareNextTick(time: number): Promise<void> {
    const promises = Array.from(this.sources.values())
      .filter(source => source.isEnabled)
      .map(source => source.prepareNextTick(time));

    try {
      await Promise.all(promises);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Reset all sources
   */
  public async reset(): Promise<void> {
    const promises = Array.from(this.sources.values()).map(source => source.reset());

    try {
      await Promise.all(promises);
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Dispose of all sources and clear the registry
   */
  public async dispose(): Promise<void> {
    const promises = Array.from(this.sources.values()).map(source => source.dispose());

    try {
      await Promise.all(promises);
      this.sources.clear();
      this.factories.clear();
      this.errorHandlers.clear();
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Register an error handler
   */
  public onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Handle errors from output sources
   */
  private handleError(error: Error): void {
    this.errorHandlers.forEach(handler => handler(error));
  }

  /**
   * Set the active output source by ID
   * Disables all other sources regardless of type
   */
  public setActiveSource(id: string): void {
    logger.info(`Setting active source to ${id}`);

    const targetSource = this.sources.get(id);
    if (!targetSource) {
      logger.error(`Output source with ID ${id} not found`);
      throw new Error(`Output source with ID ${id} not found`);
    }

    logger.debug(`Target source type is ${targetSource.type}`);

    // Enable the target source
    targetSource.setEnabled(true);
    logger.debug(`Enabled source ${id}`);

    // Update the active source ID
    this.activeSourceId = id;
    logger.debug(`Updated active source ID to ${id}`);

    // Disable all other sources regardless of type
    // Using Array.from to avoid the Map iterator issue
    Array.from(this.sources.entries()).forEach(([sourceId, source]) => {
      if (sourceId !== id) {
        logger.debug(`Disabling source ${sourceId} of type ${source.type}`);
        source.setEnabled(false);
      }
    });

    // Log all current sources and their enabled state
    logger.debug('Current sources:');
    Array.from(this.sources.entries()).forEach(([sourceId, source]) => {
      logger.debug(
        `  - ${sourceId} (type: ${source.type}): ${source.isEnabled ? 'enabled' : 'disabled'}`
      );
    });
  }
}
