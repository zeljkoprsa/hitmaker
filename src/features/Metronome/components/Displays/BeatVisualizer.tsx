import React from 'react';

import { AccentLevel } from '../../../../core/types/MetronomeTypes';

import { BeatVisualizerContainer, Beat } from './styles';

interface BeatVisualizerProps {
  timeSignature: { beats: number };
  currentBeat: number;
  accents?: AccentLevel[];
  onToggleAccent?: (index: number) => void;
}

export const BeatVisualizer: React.FC<BeatVisualizerProps> = ({
  timeSignature,
  currentBeat,
  accents = [],
  onToggleAccent,
}) => {
  return (
    <BeatVisualizerContainer>
      {Array.from({ length: timeSignature.beats }).map((_, index) => (
        <Beat
          key={index}
          active={index === currentBeat}
          accentLevel={accents[index] ?? AccentLevel.Normal}
          onClick={() => onToggleAccent && onToggleAccent(index)}
        />
      ))}
    </BeatVisualizerContainer>
  );
};
