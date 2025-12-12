/**
 * Types for sound management in the metronome application.
 * Includes definitions for sample-based sounds only.
 */

/**
 * Represents a sound option in the metronome application.
 * All sounds are sample-based (pre-recorded).
 */
export interface Sound {
  /**
   * Unique identifier for the sound
   */
  id: string;

  /**
   * Display name for the sound
   */
  name: string;

  /**
   * Type of sound generation - always sample-based
   */
  type: 'sample';

  /**
   * Category for grouping similar sounds
   */
  category: 'percussion' | 'electronic';

  /**
   * Optional description of the sound
   */
  description?: string;

  /**
   * Path to the high (accented) sample file
   * Only used for sample-based sounds
   */
  highSample?: string;

  /**
   * Path to the low (regular) sample file
   * Only used for sample-based sounds
   */
  lowSample?: string;
}

/**
 * Registry of available sounds in the application.
 * Includes only sample-based options.
 */
export const SOUNDS: Sound[] = [
  // Limited high-quality sample sets for MLP
  {
    id: 'metronome-quartz',
    name: 'Metronome Quartz',
    type: 'sample',
    category: 'percussion',
    description: 'Traditional mechanical metronome sound',
    highSample: '/assets/sounds/Perc_MetronomeQuartz_hi.wav',
    lowSample: '/assets/sounds/Perc_MetronomeQuartz_lo.wav',
  },
  {
    id: 'electronic-click',
    name: 'Electronic Click',
    type: 'sample',
    category: 'electronic',
    description: 'Clean electronic click sound',
    highSample: '/assets/sounds/Synth_Tick_A_hi.wav',
    lowSample: '/assets/sounds/Synth_Tick_A_lo.wav',
  },
  {
    id: 'digital-bell',
    name: 'Digital Bell',
    type: 'sample',
    category: 'electronic',
    description: 'Bright digital bell sound',
    highSample: '/assets/sounds/Synth_Bell_A_hi.wav',
    lowSample: '/assets/sounds/Synth_Bell_A_lo.wav',
  },
];

/**
 * Get a sound by its ID
 * @param id The ID of the sound to retrieve
 * @returns The sound object or undefined if not found
 */
export function getSoundById(id: string): Sound | undefined {
  return SOUNDS.find(sound => sound.id === id);
}
