/**
 * Metronome.test.ts
 * Tests for the Web Audio API-based Metronome implementation
 */

import { OutputSourceRegistry } from '../../output/OutputSourceRegistry';
import { AccentLevel } from '../../types/MetronomeTypes';
import { Metronome } from '../Metronome';

// Mock OutputSourceRegistry
jest.mock('../../output/OutputSourceRegistry', () => ({
  OutputSourceRegistry: {
    getInstance: jest.fn(),
  },
}));

// Mock Web Audio API
class MockAudioContext {
  currentTime = 0;
  destination = {};
  baseLatency = 0.005;

  createGain() {
    return {
      connect: jest.fn(),
      gain: { value: 1 },
    };
  }

  createOscillator() {
    return {
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      frequency: { value: 440 },
    };
  }

  resume() {
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

// Mock for requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
  return setTimeout(() => callback(Date.now()), 0) as unknown as number;
};

// Mock for cancelAnimationFrame
global.cancelAnimationFrame = (id: number): void => {
  clearTimeout(id);
};

describe('Metronome', () => {
  let metronome: Metronome;
  let mockAudioContext: MockAudioContext;
  let mockRegistryInstance: any;
  let mockAudioSource: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock audio context
    mockAudioContext = new MockAudioContext();
    (global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

    // Set up mock registry and audio source
    mockAudioSource = {
      id: 'primary-audio',
      type: 'webAudio',
      isEnabled: true,
      processTick: jest.fn().mockResolvedValue(undefined),
      onError: jest.fn(),
      setEnabled: jest.fn(),
      initialize: jest.fn().mockResolvedValue(undefined),
      dispose: jest.fn().mockResolvedValue(undefined),
      updateConfig: jest.fn().mockResolvedValue(undefined),
    };

    mockRegistryInstance = {
      createSource: jest.fn().mockResolvedValue(mockAudioSource),
      getActiveSource: jest.fn().mockReturnValue(mockAudioSource),
      updateConfig: jest.fn().mockResolvedValue(undefined),
      removeSource: jest.fn().mockResolvedValue(undefined),
      setActiveSource: jest.fn(),
      registerFactory: jest.fn(),
    };

    // Setup the static getInstance mock
    (OutputSourceRegistry.getInstance as jest.Mock).mockReturnValue(mockRegistryInstance);

    // Create new metronome instance
    metronome = new Metronome();
  });

  afterEach(async () => {
    if (metronome) {
      await metronome.dispose();
    }
  });

  describe('initialization', () => {
    it('should initialize with default configuration', async () => {
      await metronome.initialize({
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
        volume: 1.0,
        muted: false,
      });

      expect(mockRegistryInstance.createSource).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Initialization failed');
      mockRegistryInstance.createSource.mockRejectedValueOnce(error);

      await expect(
        metronome.initialize({
          tempo: 120,
          timeSignature: { beats: 4, noteValue: 4 },
          subdivision: 'quarter',
          accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
          volume: 1.0,
          muted: false,
        })
      ).rejects.toThrow('Initialization failed');
    });
  });

  describe('tempo control', () => {
    beforeEach(async () => {
      await metronome.initialize({
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
        volume: 1.0,
        muted: false,
      });
    });

    it('should set tempo within valid range', () => {
      // Test minimum tempo
      metronome.setTempo(20); // Below minimum
      expect(metronome.getCurrentState().tempo).toBe(30); // Should clamp to minimum

      // Test normal tempo
      metronome.setTempo(120);
      expect(metronome.getCurrentState().tempo).toBe(120);

      // Test maximum tempo (our extended range)
      metronome.setTempo(600); // Above maximum
      expect(metronome.getCurrentState().tempo).toBe(500); // Should clamp to maximum
    });

    it('should calculate correct beat duration based on tempo', () => {
      metronome.setTempo(60);
      expect(metronome.getBeatDuration()).toBe(1000); // 60 BPM = 1000ms per beat

      metronome.setTempo(120);
      expect(metronome.getBeatDuration()).toBe(500); // 120 BPM = 500ms per beat

      metronome.setTempo(300);
      expect(metronome.getBeatDuration()).toBe(200); // 300 BPM = 200ms per beat
    });
  });

  describe('subdivision handling', () => {
    beforeEach(async () => {
      await metronome.initialize({
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
        volume: 1.0,
        muted: false,
      });

      // Start the metronome
      await metronome.start();
    });

    it('should process main beats with the active audio source', () => {
      // Simulate a tick
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
      scheduleTick(mockAudioContext.currentTime);

      // Verify the active source was used
      expect(mockRegistryInstance.getActiveSource).toHaveBeenCalled();
      expect(mockAudioSource.processTick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'beat',
          accentLevel: expect.any(Number),
        })
      );
    });

    it('should process eighth note subdivisions with the active audio source', () => {
      // Set subdivision to eighth
      metronome.setSubdivision('eighth');

      // Simulate a tick
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
      scheduleTick(mockAudioContext.currentTime);

      // Verify the active source was used for both main beat and subdivision
      expect(mockRegistryInstance.getActiveSource).toHaveBeenCalledTimes(3);
      expect(mockAudioSource.processTick).toHaveBeenCalledTimes(3);

      // Verify the second call was for the subdivision
      expect(mockAudioSource.processTick.mock.calls[1][0]).toMatchObject({
        type: 'beat',
        accentLevel: AccentLevel.Normal, // Subdivisions are never accented
      });
    });
  });

  describe('playback control', () => {
    beforeEach(async () => {
      await metronome.initialize({
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
        volume: 1.0,
        muted: false,
      });
    });

    it('should start and stop playback', async () => {
      // Start
      await metronome.start();
      expect(metronome.isPlaying()).toBe(true);

      // Stop
      await metronome.stop();
      expect(metronome.isPlaying()).toBe(false);
    });

    it('should notify tick callbacks', async () => {
      const tickCallback = jest.fn();
      metronome.onTick(tickCallback);

      // Simulate a tick
      await metronome.start();
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
      scheduleTick(mockAudioContext.currentTime);

      expect(tickCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'beat',
          tempo: 120,
        })
      );
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await metronome.initialize({
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
        volume: 1.0,
        muted: false,
      });
    });

    it('should notify error handlers', () => {
      const errorHandler = jest.fn();
      metronome.onError(errorHandler);

      const error = new Error('Test error');
      (metronome as any).notifyError(error);

      expect(errorHandler).toHaveBeenCalledWith(error);
    });

    it('should handle errors during tick processing', async () => {
      const errorHandler = jest.fn();
      metronome.onError(errorHandler);

      // Make processTick throw an error
      const error = new Error('Tick processing error');
      mockAudioSource.processTick.mockRejectedValueOnce(error);

      // Simulate a tick
      await metronome.start();
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
      scheduleTick(mockAudioContext.currentTime);

      // Wait for the promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(errorHandler).toHaveBeenCalledWith(error);
    });
  });

  describe('subdivision switching edge cases', () => {
    beforeEach(async () => {
      await metronome.initialize({
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
        volume: 1.0,
        muted: false,
      });
      await metronome.start();
      // Reset the mock call count
      mockAudioSource.processTick.mockClear();
    });

    afterEach(async () => {
      await metronome.stop();
    });

    it('should handle rapid subdivision switching at moderate tempo', async () => {
      // Set moderate tempo
      metronome.setTempo(120);

      // Simulate a few ticks with quarter note subdivision
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 120); // Advance time by one beat at 120 BPM

      // Switch to eighth notes
      metronome.setSubdivision('eighth');

      // Simulate a few more ticks with eighth note subdivision
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 120); // Advance time by one beat at 120 BPM

      // Switch back to quarter notes
      metronome.setSubdivision('quarter');

      // Simulate a few more ticks with quarter note subdivision
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 120); // Advance time by one beat at 120 BPM

      // Verify that the audio source was called for each tick and subdivision
      // For quarter notes: 1 call per tick
      // For eighth notes: 2 calls per tick (main beat + subdivision)
      // Expected: 1 (first quarter) + 2 (eighth) + 1 (last quarter) = 4 calls
      expect(mockAudioSource.processTick).toHaveBeenCalledTimes(4);
    });

    it('should handle rapid subdivision switching at slow tempo', async () => {
      // Set slow tempo
      metronome.setTempo(40);

      // Reset the mock call count
      mockAudioSource.processTick.mockClear();

      // Simulate a tick with quarter note subdivision
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 40); // Advance time by one beat at 40 BPM

      // Switch to eighth notes
      metronome.setSubdivision('eighth');

      // Simulate a tick with eighth note subdivision
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 40); // Advance time by one beat at 40 BPM

      // Verify that the audio source was called for each tick and subdivision
      // Expected: 1 (first quarter) + 2 (eighth) = 3 calls
      expect(mockAudioSource.processTick).toHaveBeenCalledTimes(3);

      // Verify that the subdivision tick has the correct beat number (should be x.5)
      const subdivisionCall = mockAudioSource.processTick.mock.calls.find(
        (call: any) => call[0].beatNumber % 1 !== 0
      );
      expect(subdivisionCall).toBeDefined();
      expect(subdivisionCall[0].beatNumber % 1).toBeCloseTo(0.5, 2);
    });

    it('should handle rapid subdivision switching at fast tempo', async () => {
      // Set fast tempo
      metronome.setTempo(400);

      // Reset the mock call count
      mockAudioSource.processTick.mockClear();

      // Simulate a tick with quarter note subdivision
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 400); // Advance time by one beat at 400 BPM

      // Switch to eighth notes
      metronome.setSubdivision('eighth');

      // Simulate a tick with eighth note subdivision
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 400); // Advance time by one beat at 400 BPM

      // Switch back to quarter notes
      metronome.setSubdivision('quarter');

      // Simulate a tick with quarter note subdivision
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 400); // Advance time by one beat at 400 BPM

      // Verify that the audio source was called for each tick and subdivision
      // Expected: 1 (first quarter) + 2 (eighth) + 1 (last quarter) = 4 calls
      expect(mockAudioSource.processTick).toHaveBeenCalledTimes(4);

      // Verify that the timing between beats is correct for the fast tempo
      const firstTickEvent = mockAudioSource.processTick.mock.calls[0][0];
      const lastTickEvent = mockAudioSource.processTick.mock.calls[3][0];

      // At 400 BPM, beat duration should be 150ms
      expect(firstTickEvent.beatDuration).toBe(150); // 60000 / 400 = 150ms
      expect(lastTickEvent.beatDuration).toBe(150);
    });

    it('should handle alternating subdivision switching during tempo changes', async () => {
      // Reset the mock call count
      mockAudioSource.processTick.mockClear();

      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);

      // Start with moderate tempo and quarter notes
      metronome.setTempo(120);
      metronome.setSubdivision('quarter');

      // Simulate a tick
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 120);

      // Switch to eighth notes and increase tempo
      metronome.setSubdivision('eighth');
      metronome.setTempo(200);

      // Simulate a tick
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 200);

      // Switch to quarter notes and decrease tempo
      metronome.setSubdivision('quarter');
      metronome.setTempo(60);

      // Simulate a tick
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 60);

      // Switch to eighth notes and set extreme tempo
      metronome.setSubdivision('eighth');
      metronome.setTempo(480);

      // Simulate a tick
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 480);

      // Verify that all ticks were processed correctly
      // Expected: 1 (first quarter) + 2 (eighth at 200) + 1 (quarter at 60) + 2 (eighth at 480) = 6 calls
      expect(mockAudioSource.processTick).toHaveBeenCalledTimes(6);

      // Verify that the beat durations were correctly set for each tempo
      const tickEvents = mockAudioSource.processTick.mock.calls.map((call: any) => call[0]);

      // Filter to just the main beats (not subdivisions)
      const mainBeats = tickEvents.filter((event: any) => event.beatNumber % 1 === 0);

      // Check that the beat durations match the expected values for each tempo
      expect(mainBeats[0].beatDuration).toBe(500); // 60000 / 120 = 500ms
      expect(mainBeats[1].beatDuration).toBe(300); // 60000 / 200 = 300ms
      expect(mainBeats[2].beatDuration).toBe(1000); // 60000 / 60 = 1000ms
      expect(mainBeats[3].beatDuration).toBe(125); // 60000 / 480 = 125ms
    });
  });

  describe('tempo control edge cases', () => {
    beforeEach(async () => {
      await metronome.initialize({
        tempo: 120,
        timeSignature: { beats: 4, noteValue: 4 },
        subdivision: 'quarter',
        accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
        volume: 1.0,
        muted: false,
      });
      await metronome.start();
      // Reset the mock call count
      mockAudioSource.processTick.mockClear();
    });

    afterEach(async () => {
      await metronome.stop();
    });

    it('should handle rapid tempo increases', async () => {
      // Start with a moderate tempo
      metronome.setTempo(120);
      expect(metronome.getCurrentState().tempo).toBe(120);

      // Rapidly increase tempo in small increments
      for (let i = 0; i < 10; i++) {
        metronome.setTempo(120 + (i + 1) * 20); // 140, 160, 180, ..., 320
        // Simulate a tick at each tempo
        const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
        scheduleTick(mockAudioContext.currentTime + i * 0.1);
        mockAudioContext.advanceTime(0.1);
      }

      // Verify final tempo is set correctly
      expect(metronome.getCurrentState().tempo).toBe(320);
      // Verify that the audio source was called for each tempo change
      expect(mockAudioSource.processTick).toHaveBeenCalledTimes(10);
    });

    it('should handle rapid tempo decreases', async () => {
      // Start with a high tempo
      metronome.setTempo(400);
      expect(metronome.getCurrentState().tempo).toBe(400);

      // Reset the mock call count
      mockAudioSource.processTick.mockClear();

      // Rapidly decrease tempo in small increments
      for (let i = 0; i < 10; i++) {
        metronome.setTempo(400 - (i + 1) * 30); // 370, 340, 310, ..., 100
        // Simulate a tick at each tempo
        const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
        scheduleTick(mockAudioContext.currentTime + i * 0.1);
        mockAudioContext.advanceTime(0.1);
      }

      // Verify final tempo is set correctly
      expect(metronome.getCurrentState().tempo).toBe(100);
      // Verify that the audio source was called for each tempo change
      expect(mockAudioSource.processTick).toHaveBeenCalledTimes(10);
    });

    it('should handle extreme tempo changes', async () => {
      // Reset the mock call count
      mockAudioSource.processTick.mockClear();

      // Start with minimum tempo
      metronome.setTempo(30);
      expect(metronome.getCurrentState().tempo).toBe(30);

      // Simulate a tick at minimum tempo
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 30); // Advance time by one beat at 30 BPM

      // Jump to maximum tempo
      metronome.setTempo(500);
      expect(metronome.getCurrentState().tempo).toBe(500);

      // Simulate a tick at maximum tempo
      scheduleTick(mockAudioContext.currentTime);
      mockAudioContext.advanceTime(60 / 500); // Advance time by one beat at 500 BPM

      // Jump back to minimum tempo
      metronome.setTempo(30);
      expect(metronome.getCurrentState().tempo).toBe(30);

      // Simulate a tick at minimum tempo again
      scheduleTick(mockAudioContext.currentTime);

      // Verify that the audio source was called for each tempo change
      expect(mockAudioSource.processTick).toHaveBeenCalledTimes(3);
    });

    it('should maintain accurate timing during rapid tempo changes', async () => {
      // Reset the mock call count
      mockAudioSource.processTick.mockClear();

      // Start with a moderate tempo
      metronome.setTempo(120);

      // Mock the current time
      let currentTime = mockAudioContext.currentTime;
      const scheduleTick = (metronome as any).scheduleTick.bind(metronome);

      // Simulate first tick and capture the next tick time
      scheduleTick(currentTime);
      const firstTickEvent = mockAudioSource.processTick.mock.calls[0][0];
      const firstNextTickTime = firstTickEvent.nextTickTime;

      // Advance time to just before the next tick
      currentTime = firstNextTickTime - 0.01;
      mockAudioContext.advanceTime(firstNextTickTime - 0.01 - mockAudioContext.currentTime);

      // Change tempo drastically
      metronome.setTempo(240); // Double the tempo

      // Simulate the next tick
      scheduleTick(currentTime);
      const secondTickEvent = mockAudioSource.processTick.mock.calls[1][0];

      // Verify that the next tick time is correctly adjusted for the new tempo
      // At 240 BPM, the beat duration should be half of what it was at 120 BPM
      expect(secondTickEvent.beatDuration).toBe(250); // 60000 / 240 = 250ms
      expect(secondTickEvent.nextTickTime).toBeGreaterThan(currentTime);

      // The difference between consecutive ticks should reflect the new tempo
      const timeDifference = secondTickEvent.nextTickTime - currentTime;
      expect(timeDifference).toBeCloseTo(60 / 240, 2); // Should be close to the period of 240 BPM in seconds
    });
  });
});
