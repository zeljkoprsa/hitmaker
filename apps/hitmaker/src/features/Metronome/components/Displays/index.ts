// src/features/Metronome/components/Displays/index.ts

import { BeatVisualizer } from './BeatVisualizer';
import { TempoDisplay } from './TempoDisplay';
import { TimeSignatureDisplay } from './TimeSignatureDisplay';

// Export components individually
export { TempoDisplay, BeatVisualizer, TimeSignatureDisplay };

// Export as namespace object
export const Displays = {
  TempoDisplay,
  BeatVisualizer,
  TimeSignatureDisplay,
};
