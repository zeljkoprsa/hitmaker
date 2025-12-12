import React from 'react';

import { TempoContainer, TempoText } from './styles';

interface TempoDisplayProps {
  tempo: number;
}

export const TempoDisplay: React.FC<TempoDisplayProps> = ({ tempo }) => {
  return (
    <TempoContainer>
      <TempoText>{tempo}</TempoText>
    </TempoContainer>
  );
};
