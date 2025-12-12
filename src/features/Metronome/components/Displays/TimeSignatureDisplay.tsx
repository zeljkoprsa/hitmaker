import React from 'react';

import { TimeSignatureContainer, TimeSignatureNumber } from './styles';

interface TimeSignatureDisplayProps {
  timeSignature: {
    beats: number;
    value: number;
  };
}

export const TimeSignatureDisplay: React.FC<TimeSignatureDisplayProps> = ({ timeSignature }) => {
  return (
    <TimeSignatureContainer>
      <TimeSignatureNumber>{timeSignature.beats}</TimeSignatureNumber>
      <TimeSignatureNumber>{timeSignature.value}</TimeSignatureNumber>
    </TimeSignatureContainer>
  );
};
