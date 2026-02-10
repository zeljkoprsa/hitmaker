/**
 * Time Signature Utilities
 * Provides classification, default patterns, and preset definitions for all time signatures
 */

import { AccentLevel } from '../types/MetronomeTypes';

export enum MeterType {
  Simple = 'simple',
  Compound = 'compound',
  Irregular = 'irregular',
}

export interface TimeSignatureInfo {
  type: MeterType;
  beatsPerMeasure: number;
  noteValue: number;
  display: string;
  description: string;
}

export interface PresetPattern {
  name: string;
  description: string;
  pattern: AccentLevel[];
}

/**
 * Classifies a time signature into its meter type
 */
export function classifyTimeSignature(beats: number, noteValue: number): MeterType {
  // Compound meters: divisible by 3, with eighth note base
  if (noteValue === 8 && beats % 3 === 0 && beats >= 6) {
    return MeterType.Compound;
  }

  // Irregular meters: 5 or 7 beats
  if (beats === 5 || beats === 7) {
    return MeterType.Irregular;
  }

  // Everything else is simple
  return MeterType.Simple;
}

/**
 * Gets time signature information
 */
export function getTimeSignatureInfo(beats: number, noteValue: number): TimeSignatureInfo {
  const type = classifyTimeSignature(beats, noteValue);
  const descriptions: Record<string, string> = {
    '4/4': 'Common Time',
    '3/4': 'Waltz Time',
    '2/4': 'March Time',
    '1/4': 'Single Beat',
    '2/2': 'Cut Time',
    '6/8': 'Compound Duple',
    '9/8': 'Compound Triple',
    '12/8': 'Compound Quadruple',
    '5/4': 'Irregular (3+2 or 2+3)',
    '7/8': 'Balkan/Irregular',
  };

  return {
    type,
    beatsPerMeasure: beats,
    noteValue,
    display: `${beats}/${noteValue}`,
    description: descriptions[`${beats}/${noteValue}`] || 'Custom',
  };
}

/**
 * Gets the default accent pattern for a time signature
 * This matches the auto-generation logic in Metronome.ts
 */
export function getDefaultAccentPattern(beats: number, noteValue: number): AccentLevel[] {
  const pattern: AccentLevel[] = new Array(beats).fill(AccentLevel.Normal);

  // Always accent the first beat
  if (pattern.length > 0) {
    pattern[0] = AccentLevel.Accent;
  }

  // Apply specific patterns for compound meters
  if (noteValue === 8) {
    if (beats === 6) {
      // 6/8: Strong on 1, Strong on 4
      pattern[3] = AccentLevel.Accent;
    } else if (beats === 9) {
      // 9/8: Strong on 1, 4, 7
      pattern[3] = AccentLevel.Accent;
      pattern[6] = AccentLevel.Accent;
    } else if (beats === 12) {
      // 12/8: Strong on 1, 4, 7, 10
      pattern[3] = AccentLevel.Accent;
      pattern[6] = AccentLevel.Accent;
      pattern[9] = AccentLevel.Accent;
    }
  } else if (noteValue === 4 && beats === 4) {
    // 4/4: Strong on 1, Medium on 3
    pattern[2] = AccentLevel.Accent;
  }

  return pattern;
}

/**
 * Gets all available presets for a specific time signature
 */
export function getPresetsForTimeSignature(beats: number, noteValue: number): PresetPattern[] {
  const key = `${beats}/${noteValue}`;

  const presetMap: Record<string, PresetPattern[]> = {
    '4/4': [
      {
        name: 'Downbeat',
        description: 'Accent on beat 1 only',
        pattern: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
      },
      {
        name: 'Backbeat',
        description: 'Rock/Pop style (beats 2 & 4)',
        pattern: [AccentLevel.Normal, AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Accent],
      },
      {
        name: 'Strong Beats',
        description: 'Accent on beats 1 & 3',
        pattern: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Accent, AccentLevel.Normal],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [AccentLevel.Accent, AccentLevel.Accent, AccentLevel.Accent, AccentLevel.Accent],
      },
    ],

    '3/4': [
      {
        name: 'Downbeat',
        description: 'Traditional waltz (beat 1)',
        pattern: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [AccentLevel.Accent, AccentLevel.Accent, AccentLevel.Accent],
      },
      {
        name: 'Emphasis 2',
        description: 'Syncopated feel',
        pattern: [AccentLevel.Normal, AccentLevel.Accent, AccentLevel.Normal],
      },
      {
        name: 'Emphasis 3',
        description: 'Pickup feel',
        pattern: [AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Accent],
      },
    ],

    '2/4': [
      {
        name: 'Downbeat',
        description: 'March style (beat 1)',
        pattern: [AccentLevel.Accent, AccentLevel.Normal],
      },
      {
        name: 'Backbeat',
        description: 'Syncopated (beat 2)',
        pattern: [AccentLevel.Normal, AccentLevel.Accent],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [AccentLevel.Accent, AccentLevel.Accent],
      },
    ],

    '1/4': [
      {
        name: 'Accent',
        description: 'Single accented beat',
        pattern: [AccentLevel.Accent],
      },
      {
        name: 'Normal',
        description: 'Unaccented beat',
        pattern: [AccentLevel.Normal],
      },
    ],

    '2/2': [
      {
        name: 'Downbeat',
        description: 'Cut time (beat 1)',
        pattern: [AccentLevel.Accent, AccentLevel.Normal],
      },
      {
        name: 'Backbeat',
        description: 'Syncopated (beat 2)',
        pattern: [AccentLevel.Normal, AccentLevel.Accent],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [AccentLevel.Accent, AccentLevel.Accent],
      },
    ],

    '6/8': [
      {
        name: 'Compound',
        description: 'Two groups of three (beats 1 & 4)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'Downbeat',
        description: 'Single strong beat',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
        ],
      },
    ],

    '9/8': [
      {
        name: 'Compound',
        description: 'Three groups of three (beats 1, 4 & 7)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'Downbeat',
        description: 'Single strong beat',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'Two Groups',
        description: '6+3 grouping (beats 1 & 7)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
        ],
      },
    ],

    '12/8': [
      {
        name: 'Compound',
        description: 'Four groups of three (beats 1, 4, 7 & 10)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'Downbeat',
        description: 'Single strong beat',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'Half Time',
        description: 'Two groups (beats 1 & 7)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
        ],
      },
    ],

    '5/4': [
      {
        name: '3+2 Grouping',
        description: 'Take Five style (beats 1 & 4)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
        ],
      },
      {
        name: '2+3 Grouping',
        description: 'Alternative grouping (beats 1 & 3)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'Downbeat',
        description: 'Simple emphasis on beat 1',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
        ],
      },
    ],

    '7/8': [
      {
        name: '2+2+3 Balkan',
        description: 'Common Balkan pattern (beats 1, 3 & 5)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: '3+2+2 Pattern',
        description: 'Alternative grouping (beats 1, 4 & 6)',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Accent,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'Downbeat',
        description: 'Simple emphasis on beat 1',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
          AccentLevel.Normal,
        ],
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: [
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
          AccentLevel.Accent,
        ],
      },
    ],
  };

  // Return presets for this time signature, or fallback to basic presets
  return (
    presetMap[key] || [
      {
        name: 'Downbeat',
        description: 'Accent on beat 1 only',
        pattern: (() => {
          const p = new Array(beats).fill(AccentLevel.Normal);
          p[0] = AccentLevel.Accent;
          return p;
        })(),
      },
      {
        name: 'All Beats',
        description: 'Every beat accented',
        pattern: new Array(beats).fill(AccentLevel.Accent),
      },
    ]
  );
}
