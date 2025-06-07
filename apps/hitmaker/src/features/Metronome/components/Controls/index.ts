// src/features/Metronome/components/Controls/index.ts

import { StartStopButton } from './StartStopButton';
import { SubdivisionControl } from './SubdivisionControl';
import { TapTempoControl } from './TapTempoControl';
import { TempoControl } from './TempoControl';
import TempoDisplay from './TempoDisplay';
import { TimeSignatureControl } from './TimeSignatureControl';
import { VolumeControl } from './VolumeControl';

// Export components individually
export {
  StartStopButton,
  TempoControl,
  TempoDisplay,
  TimeSignatureControl,
  SubdivisionControl,
  VolumeControl,
  TapTempoControl,
};

// Export as namespace object
export const Controls = {
  StartStopButton,
  TempoControl,
  TempoDisplay,
  TimeSignatureControl,
  SubdivisionControl,
  VolumeControl,
  TapTempoControl,
};
