import '@testing-library/jest-dom';

// Extend the global interface to explicitly declare webkitAudioContext
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

class MockAudioContext implements Partial<AudioContext> {
  state: AudioContextState = 'suspended';
  resume = jest.fn().mockResolvedValue(undefined);
  close = jest.fn().mockResolvedValue(undefined);
  createGain = jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
    },
  });
  createBufferSource = jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  });
}

// Cast the mock to the correct type
const MockAudioContextClass = MockAudioContext as unknown as typeof AudioContext;

// Assign to standard AudioContext
(global as any).AudioContext = MockAudioContextClass;

// Conditionally assign to webkit-prefixed AudioContext if it exists
if ('webkitAudioContext' in window) {
  (global as any).webkitAudioContext = MockAudioContextClass;
}
