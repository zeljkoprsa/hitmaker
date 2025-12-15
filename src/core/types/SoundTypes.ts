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
  // Percussion
  {
    id: 'metronome-quartz',
    name: 'Quartz',
    type: 'sample',
    category: 'percussion',
    description: 'Traditional mechanical metronome',
    highSample: '/assets/sounds/Perc_MetronomeQuartz_hi.wav',
    lowSample: '/assets/sounds/Perc_MetronomeQuartz_lo.wav',
  },
  {
    id: 'perc-sticks',
    name: 'Sticks',
    type: 'sample',
    category: 'percussion',
    description: 'Wooden sticks clicking',
    highSample: '/assets/sounds/Perc_Stick_hi.wav',
    lowSample: '/assets/sounds/Perc_Stick_lo.wav',
  },
  {
    id: 'perc-woodblock',
    name: 'Block',
    type: 'sample',
    category: 'percussion',
    description: 'Resonant woodblock',
    highSample: '/assets/sounds/Synth_Block_A_hi.wav',
    lowSample: '/assets/sounds/Synth_Block_A_lo.wav',
  },
  {
    id: 'perc-clap',
    name: 'Clap',
    type: 'sample',
    category: 'percussion',
    description: 'Sharp hand clap',
    highSample: '/assets/sounds/Perc_Clap_hi.wav',
    lowSample: '/assets/sounds/Perc_Clap_lo.wav',
  },
  {
    id: 'perc-cowbell',
    name: 'Cowbell',
    type: 'sample',
    category: 'percussion',
    description: 'Sharp metallic click',
    highSample: '/assets/sounds/Perc_Metal_hi.wav',
    lowSample: '/assets/sounds/Perc_Metal_lo.wav',
  },

  // Electronic
  {
    id: 'electronic-click',
    name: 'Click',
    type: 'sample',
    category: 'electronic',
    description: 'Clean electronic pulse',
    highSample: '/assets/sounds/Synth_Tick_A_hi.wav',
    lowSample: '/assets/sounds/Synth_Tick_A_lo.wav',
  },
  {
    id: 'digital-bell',
    name: 'Bell',
    type: 'sample',
    category: 'electronic',
    description: 'Bright digital chime',
    highSample: '/assets/sounds/Synth_Bell_A_hi.wav',
    lowSample: '/assets/sounds/Synth_Bell_A_lo.wav',
  },
  {
    id: 'synth-blip',
    name: 'Blip',
    type: 'sample',
    category: 'electronic',
    description: 'Short synthesized blip',
    highSample: '/assets/sounds/Synth_Square_A_hi.wav',
    lowSample: '/assets/sounds/Synth_Square_A_lo.wav',
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
