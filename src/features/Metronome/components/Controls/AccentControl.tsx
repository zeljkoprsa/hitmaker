import React, { useMemo } from 'react';

import { AccentLevel } from '../../../../core/types/MetronomeTypes';
import { getPresetsForTimeSignature } from '../../../../core/utils/timeSignatureUtils';

import { AccentControlContainer, PresetButtonList, PresetButton } from './styles';

interface AccentControlProps {
  accents: AccentLevel[];
  timeSignature: { beats: number; noteValue: number };
  onApplyPreset: (preset: AccentLevel[]) => void;
}

export const AccentControl: React.FC<AccentControlProps> = ({
  accents,
  timeSignature,
  onApplyPreset,
}) => {
  // Get available presets for current time signature
  const availablePresets = useMemo(() => {
    return getPresetsForTimeSignature(timeSignature.beats, timeSignature.noteValue);
  }, [timeSignature.beats, timeSignature.noteValue]);

  // Detect if current pattern matches any preset
  const activePreset = useMemo(() => {
    for (const preset of availablePresets) {
      if (
        preset.pattern.length === accents.length &&
        preset.pattern.every((level, index) => level === accents[index])
      ) {
        return preset.name;
      }
    }
    return 'Custom';
  }, [accents, availablePresets]);

  return (
    <AccentControlContainer>
      <PresetButtonList>
        {availablePresets.map(preset => (
          <PresetButton
            key={preset.name}
            active={activePreset === preset.name}
            onClick={() => onApplyPreset(preset.pattern)}
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
