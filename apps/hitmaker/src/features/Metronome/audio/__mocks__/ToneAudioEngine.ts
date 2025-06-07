const ToneAudioEngine = jest.fn().mockImplementation(() => ({
  init: jest.fn().mockResolvedValue(undefined),
  playClick: jest.fn((_isAccented: boolean, _isSubdivision: boolean, _time: number) => undefined),
  setMute: jest.fn((_muted: boolean) => undefined),
  dispose: jest.fn(),
}));

export default ToneAudioEngine;
