/**
 * SampleAudioSource.test.ts
 * Tests for the sample-based audio output source
 */

import { OutputSourceConfig } from '../../interfaces/IOutputSource';
import { ITickEvent } from '../../interfaces/ITickEvent';
import { SampleAudioSource } from '../SampleAudioSource';

// Mock getSoundById function
jest.mock('../../types/SoundTypes', () => ({
  getSoundById: jest.fn().mockImplementation(id => {
    if (id === 'invalid-sound') return null;

    return {
      id,
      name: `Test Sound ${id}`,
      type: 'sample',
      category: 'percussion',
      highSample: `/assets/sounds/${id}_hi.wav`,
      lowSample: `/assets/sounds/${id}_lo.wav`,
    };
  }),
}));

// Mock Web Audio API
class MockAudioContext {
  currentTime = 0;
  destination = {};
  baseLatency = 0.005;
  state = 'running';

  createGain() {
    return {
      connect: jest.fn(),
      gain: { value: 1 },
    };
  }

  createBufferSource() {
    return {
      connect: jest.fn(),
      start: jest.fn(),
      buffer: null,
      onended: null,
    };
  }

  decodeAudioData() {
    return Promise.resolve({
      duration: 0.2,
      numberOfChannels: 2,
      sampleRate: 44100,
    });
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }

  // Simulate time passing
  advanceTime(seconds: number) {
    this.currentTime += seconds;
  }
}

// Mock fetch for loading audio samples
global.fetch = jest.fn().mockImplementation(_url => {
  return Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(1000)),
  });
});

describe('SampleAudioSource', () => {
  let sampleSource: SampleAudioSource;
  let mockAudioContext: MockAudioContext;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock audio context
    mockAudioContext = new MockAudioContext();
    (global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

    // Create a new SampleAudioSource instance
    const config: OutputSourceConfig = {
      id: 'sample',
      type: 'sample',
      enabled: true,
      options: {
        volume: 1.0,
        muted: false,
        soundId: 'metronome-quartz',
      },
    };

    sampleSource = new SampleAudioSource(config);
  });

  afterEach(async () => {
    if (sampleSource) {
      await sampleSource.dispose();
    }
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const config: OutputSourceConfig = {
        id: 'sample',
        type: 'sample',
        enabled: true,
        options: {
          volume: 1.0,
          muted: false,
          soundId: 'metronome-quartz',
        },
      };

      await expect(sampleSource.initialize(config)).resolves.not.toThrow();
    });

    it('should handle initialization errors', async () => {
      // Make AudioContext throw an error
      (global as any).AudioContext = jest.fn().mockImplementation(() => {
        throw new Error('AudioContext initialization failed');
      });

      const config: OutputSourceConfig = {
        id: 'sample',
        type: 'sample',
        enabled: true,
        options: {
          volume: 1.0,
          muted: false,
          soundId: 'metronome-quartz',
        },
      };

      const errorSource = new SampleAudioSource(config);
      await expect(errorSource.initialize(config)).rejects.toThrow();
    });
  });

  describe('sound management', () => {
    beforeEach(async () => {
      const config: OutputSourceConfig = {
        id: 'sample',
        type: 'sample',
        enabled: true,
        options: {
          volume: 1.0,
          muted: false,
          soundId: 'metronome-quartz',
        },
      };

      await sampleSource.initialize(config);
    });

    it('should set sound successfully', async () => {
      await expect(sampleSource.setSound('electronic-click')).resolves.not.toThrow();
      expect(sampleSource.getCurrentSoundId()).toBe('electronic-click');
    });

    it('should handle invalid sound IDs', async () => {
      await expect(sampleSource.setSound('invalid-sound')).rejects.toThrow();
      // Sound ID should remain unchanged
      expect(sampleSource.getCurrentSoundId()).toBe('metronome-quartz');
    });
  });

  describe('tick processing', () => {
    beforeEach(async () => {
      const config: OutputSourceConfig = {
        id: 'sample',
        type: 'sample',
        enabled: true,
        options: {
          volume: 1.0,
          muted: false,
          soundId: 'metronome-quartz',
        },
      };

      await sampleSource.initialize(config);

      // Mock the sampleBuffers Map
      (sampleSource as any).sampleBuffers.set('/assets/sounds/metronome-quartz_hi.wav', {});
      (sampleSource as any).sampleBuffers.set('/assets/sounds/metronome-quartz_lo.wav', {});
    });

    it('should process regular beat ticks', async () => {
      const tickEvent: ITickEvent = {
        type: 'beat',
        timestamp: mockAudioContext.currentTime,
        beatNumber: 1,
        measureNumber: 1,
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        isAccented: false,
        beatDuration: 500,
        nextTickTime: mockAudioContext.currentTime + 0.5,
      };

      // Spy on the playClick method
      const playClickSpy = jest.spyOn(sampleSource as any, 'playClick');

      await sampleSource.processTick(tickEvent);

      expect(playClickSpy).toHaveBeenCalledWith(tickEvent.timestamp, tickEvent.isAccented);
    });

    it('should process accented beat ticks', async () => {
      const tickEvent: ITickEvent = {
        type: 'beat',
        timestamp: mockAudioContext.currentTime,
        beatNumber: 1,
        measureNumber: 1,
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        isAccented: true,
        beatDuration: 500,
        nextTickTime: mockAudioContext.currentTime + 0.5,
      };

      // Spy on the playClick method
      const playClickSpy = jest.spyOn(sampleSource as any, 'playClick');

      await sampleSource.processTick(tickEvent);

      expect(playClickSpy).toHaveBeenCalledWith(
        tickEvent.timestamp,
        true // Should use accented (high) sample
      );
    });

    it('should process subdivision ticks', async () => {
      const tickEvent: ITickEvent = {
        type: 'beat',
        timestamp: mockAudioContext.currentTime,
        beatNumber: 1.5, // Fractional beat number indicates subdivision
        measureNumber: 1,
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'eighth',
        isAccented: false, // Subdivisions are never accented
        beatDuration: 500,
        nextTickTime: mockAudioContext.currentTime + 0.5,
      };

      // Spy on the playClick method
      const playClickSpy = jest.spyOn(sampleSource as any, 'playClick');

      await sampleSource.processTick(tickEvent);

      expect(playClickSpy).toHaveBeenCalledWith(
        tickEvent.timestamp,
        false // Should use regular (low) sample for subdivision
      );
    });

    it('should handle suspended audio context', async () => {
      // Set audio context to suspended state
      mockAudioContext.state = 'suspended';

      const tickEvent: ITickEvent = {
        type: 'beat',
        timestamp: mockAudioContext.currentTime,
        beatNumber: 1,
        measureNumber: 1,
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        isAccented: false,
        beatDuration: 500,
        nextTickTime: mockAudioContext.currentTime + 0.5,
      };

      // Spy on the resume method
      const resumeSpy = jest.spyOn(mockAudioContext, 'resume');

      await sampleSource.processTick(tickEvent);

      expect(resumeSpy).toHaveBeenCalled();
    });
  });

  describe('volume and mute control', () => {
    beforeEach(async () => {
      const config: OutputSourceConfig = {
        id: 'sample',
        type: 'sample',
        enabled: true,
        options: {
          volume: 1.0,
          muted: false,
          soundId: 'metronome-quartz',
        },
      };

      await sampleSource.initialize(config);
    });

    it('should set volume correctly', () => {
      // Set volume to 0.5
      (sampleSource as any).setVolume(0.5);
      expect(sampleSource.getVolume()).toBe(0.5);

      // Test volume clamping (below 0)
      (sampleSource as any).setVolume(-0.5);
      expect(sampleSource.getVolume()).toBe(0);

      // Test volume clamping (above 1)
      (sampleSource as any).setVolume(1.5);
      expect(sampleSource.getVolume()).toBe(1);
    });

    it('should set muted state correctly', () => {
      // Set muted to true
      (sampleSource as any).setMuted(true);
      expect(sampleSource.isMuted()).toBe(true);

      // Set muted to false
      (sampleSource as any).setMuted(false);
      expect(sampleSource.isMuted()).toBe(false);
    });

    it('should update gain value based on volume and mute state', () => {
      const gainNode = (sampleSource as any).gainNode;

      // Set volume to 0.7 (not muted)
      (sampleSource as any).setVolume(0.7);
      expect(gainNode.gain.value).toBe(0.7);

      // Set muted to true
      (sampleSource as any).setMuted(true);
      expect(gainNode.gain.value).toBe(0);

      // Set muted to false (should restore volume)
      (sampleSource as any).setMuted(false);
      expect(gainNode.gain.value).toBe(0.7);
    });
  });
});
