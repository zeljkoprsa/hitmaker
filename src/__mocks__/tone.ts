// Define the Loop interface to match Tone.js types
interface Loop {
  start(time?: number): this;
  stop(time?: number): this;
  dispose(): void;
  interval: string;
}

// Mock implementation of Tone.Loop
class MockLoop implements Loop {
  interval: string;
  private callback: (time: number) => void;
  private isStarted: boolean = false;

  constructor(callback: (time: number) => void, interval: string) {
    this.callback = callback;
    this.interval = interval;
  }

  start(time: number = 0): this {
    this.isStarted = true;
    // Simulate the first tick
    setTimeout(() => {
      if (this.isStarted) {
        this.callback(time);
      }
    }, 0);
    return this;
  }

  stop(time?: number): this {
    this.isStarted = false;
    return this;
  }

  dispose(): void {
    this.isStarted = false;
    this.callback = () => {};
  }

  // Helper method for tests to trigger the callback
  triggerCallback(time: number = 0): void {
    if (this.isStarted) {
      this.callback(time);
    }
  }
}

const mockTransport = {
  start: jest.fn(),
  stop: jest.fn(),
  bpm: {
    value: 120,
    rampTo: jest.fn()
  },
  position: "0:0:0",
  timeSignature: [4, 4],
  clear: jest.fn(),
  cancel: jest.fn()
};

export const start = jest.fn().mockResolvedValue(undefined);
export const Transport = mockTransport;

// Create a constructor function that matches both Tone.Loop and Jest's Mock type
const LoopMock = jest.fn().mockImplementation((callback: (time: number) => void, interval: string) => {
  return new MockLoop(callback, interval);
});

export const Loop = LoopMock as jest.Mock & {
  prototype: Loop;
  new (callback: (time: number) => void, interval: string): Loop;
};

export const context = {
  state: 'running',
  resume: jest.fn().mockResolvedValue(undefined)
};

// Add default export for compatibility with both import styles
export default {
  start,
  Transport: mockTransport,
  Loop,
  context
};
