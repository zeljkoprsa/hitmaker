import React, { useMemo } from 'react';

import { AccentLevel } from '../../../../core/types/MetronomeTypes';

import { AccentControlContainer, AccentHeader, PresetButtonList, PresetButton } from './styles';

interface AccentControlProps {
  accents: AccentLevel[];
  timeSignature: { beats: number; noteValue: number };
  onApplyPreset: (preset: AccentLevel[]) => void;
}

type PresetPattern = {
  name: string;
  description: string;
  pattern: (beats: number, noteValue: number) => AccentLevel[];
};

const PRESET_PATTERNS: PresetPattern[] = [
  {
    name: 'Downbeat',
    description: 'Accent on beat 1 only',
    pattern: beats => {
      const pattern = new Array(beats).fill(AccentLevel.Normal);
      pattern[0] = AccentLevel.Accent;
      return pattern;
    },
  },
  {
    name: 'All Beats',
    description: 'All beats accented',
    pattern: beats => new Array(beats).fill(AccentLevel.Accent),
  },
  {
    name: 'Backbeat',
    description: 'Accent on beats 2 & 4',
    pattern: beats => {
      const pattern = new Array(beats).fill(AccentLevel.Normal);
      if (beats >= 2) pattern[1] = AccentLevel.Accent;
      if (beats >= 4) pattern[3] = AccentLevel.Accent;
      return pattern;
    },
  },
  {
    name: 'Compound',
    description: 'Pattern for compound meters',
    pattern: (beats, noteValue) => {
      const pattern = new Array(beats).fill(AccentLevel.Normal);
      pattern[0] = AccentLevel.Accent;

      // Compound meters (6/8, 9/8, 12/8)
      if (noteValue === 8) {
        if (beats === 6) {
          pattern[3] = AccentLevel.Accent;
        } else if (beats === 9) {
          pattern[3] = AccentLevel.Accent;
          pattern[6] = AccentLevel.Accent;
        } else if (beats === 12) {
          pattern[3] = AccentLevel.Accent;
          pattern[6] = AccentLevel.Accent;
          pattern[9] = AccentLevel.Accent;
        }
      }
      // 4/4 with secondary accent on 3
      else if (noteValue === 4 && beats === 4) {
        pattern[2] = AccentLevel.Accent;
      }

      return pattern;
    },
  },
];

export const AccentControl: React.FC<AccentControlProps> = ({
  accents,
  timeSignature,
  onApplyPreset,
}) => {
  // Detect if current pattern matches any preset
  const activePreset = useMemo(() => {
    for (const preset of PRESET_PATTERNS) {
      const presetPattern = preset.pattern(timeSignature.beats, timeSignature.noteValue);
      if (
        presetPattern.length === accents.length &&
        presetPattern.every((level, index) => level === accents[index])
      ) {
        return preset.name;
      }
    }
    return 'Custom';
  }, [accents, timeSignature.beats, timeSignature.noteValue]);

  return (
    <AccentControlContainer>
      <AccentHeader isCustom={activePreset === 'Custom'}>
        Accent Patterns
        {activePreset === 'Custom' && <span className="custom-badge">Custom</span>}
      </AccentHeader>
      <PresetButtonList>
        {PRESET_PATTERNS.map(preset => (
          <PresetButton
            key={preset.name}
            active={activePreset === preset.name}
            onClick={() =>
              onApplyPreset(preset.pattern(timeSignature.beats, timeSignature.noteValue))
            }
            title={preset.description}
            aria-label={`${preset.name}: ${preset.description}`}
          >
            {preset.name}
          </PresetButton>
        ))}
      </PresetButtonList>
    </AccentControlContainer>
  );
};
