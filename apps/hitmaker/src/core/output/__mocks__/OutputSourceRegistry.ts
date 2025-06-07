import { IOutputSource, OutputSourceConfig } from '@core/interfaces/IOutputSource';
import { ITickEvent } from '@core/interfaces/ITickEvent';
import { MetronomeConfig } from '@core/types/MetronomeTypes';

// Create a mock output source for testing
const defaultSource: IOutputSource = {
  // Required readonly properties
  id: 'default-audio',
  type: 'audio',
  isInitialized: true,
  isEnabled: true,

  // Lifecycle methods
  initialize: jest.fn().mockResolvedValue(undefined),
  dispose: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),

  // Event processing methods
  processTick: jest.fn().mockResolvedValue(undefined),
  prepareNextTick: jest.fn().mockResolvedValue(undefined),

  // Configuration methods
  updateConfig: jest.fn().mockResolvedValue(undefined),
  getConfig: jest.fn().mockReturnValue({ 
    id: 'default-audio', 
    type: 'audio',
    enabled: true 
  }),
  setEnabled: jest.fn(),

  // Error handling methods
  handleError: jest.fn(),
  onError: jest.fn().mockReturnValue(() => {}),

  // State change handling
  onStateChange: jest.fn().mockReturnValue(() => {})
};

class MockOutputSourceRegistry {
  private static instance: MockOutputSourceRegistry;
  private sources: Map<string, IOutputSource>;
  private errorHandlers: Set<(error: Error) => void>;

  private constructor() {
    this.sources = new Map();
    this.errorHandlers = new Set();
    // Add default audio source
    this.sources.set('default-audio', defaultSource);
  }

  public createSource = jest.fn().mockImplementation(async (config: OutputSourceConfig) => {
    const source = { 
      ...defaultSource, 
      id: config.id, 
      type: config.type,
      getConfig: jest.fn().mockReturnValue(config)
    };
    this.sources.set(config.id, source);
    return source;
  });

  public getSource(id: string): IOutputSource | undefined {
    return this.sources.get(id);
  }

  public processTick = jest.fn().mockImplementation(async (event: ITickEvent) => {
    try {
      const promises = Array.from(this.sources.values())
        .filter(source => source.isEnabled)
        .map(source => source.processTick(event));
      await Promise.all(promises);
    } catch (error) {
      this.notifyError(error as Error);
      throw error;
    }
  });

  public prepareNextTick = jest.fn().mockImplementation(async (time: number) => {
    try {
      const promises = Array.from(this.sources.values())
        .filter(source => source.isEnabled)
        .map(source => source.prepareNextTick(time));
      await Promise.all(promises);
    } catch (error) {
      this.notifyError(error as Error);
      throw error;
    }
  });

  public updateConfig = jest.fn().mockImplementation(async (config: MetronomeConfig) => {
    try {
      const promises = Array.from(this.sources.values())
        .filter(source => source.isEnabled)
        .map(source => source.updateConfig(config));
      await Promise.all(promises);
    } catch (error) {
      this.notifyError(error as Error);
      throw error;
    }
  });

  public dispose = jest.fn().mockImplementation(async () => {
    const promises = Array.from(this.sources.values()).map(source => source.dispose());
    await Promise.all(promises);
    this.sources.clear();
    this.errorHandlers.clear();
  });

  public onError(handler: (error: Error) => void): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  public reset = jest.fn().mockImplementation(() => {
    jest.clearAllMocks();
    this.sources = new Map();
    this.errorHandlers.clear();
    // Re-add default audio source after reset
    this.sources.set('default-audio', defaultSource);
  });

  private notifyError(error: Error): void {
    Array.from(this.errorHandlers).forEach(handler => handler(error));
  }

  public static getInstance(): MockOutputSourceRegistry {
    if (!MockOutputSourceRegistry.instance) {
      MockOutputSourceRegistry.instance = new MockOutputSourceRegistry();
    }
    return MockOutputSourceRegistry.instance;
  }
}

// Export the class as the default export for the mock
export { MockOutputSourceRegistry as OutputSourceRegistry };
