const WebAudioEngine = jest.fn().mockImplementation(() => ({
  loadSound: jest.fn().mockResolvedValue(undefined),
  playSound: jest.fn((_soundId: string) => undefined),
  setVolume: jest.fn(),
  stopAll: jest.fn(),
  isLoaded: jest.fn((_soundId: string) => false),
  preloadSounds: jest.fn().mockResolvedValue(undefined),
  resumeAudioContext: jest.fn().mockResolvedValue(undefined),
  getCurrentTime: jest.fn(() => 0),
}));

export default WebAudioEngine;
