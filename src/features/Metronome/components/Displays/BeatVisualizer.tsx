import React from 'react';

import { BeatVisualizerContainer, Beat } from './styles';

interface BeatVisualizerProps {
  timeSignature: { beats: number };
  currentBeat: number;
}

export const BeatVisualizer: React.FC<BeatVisualizerProps> = ({ timeSignature, currentBeat }) => {
  return (
    <BeatVisualizerContainer>
      {Array.from({ length: timeSignature.beats }).map((_, index) => (
        <Beat key={index} active={index === currentBeat} />
      ))}
    </BeatVisualizerContainer>
  );
};
