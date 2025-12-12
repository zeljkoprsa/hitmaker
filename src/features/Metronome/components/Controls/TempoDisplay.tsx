import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import React from 'react';

import { useResponsive } from '../../../../hooks/useResponsive';
import { useMetronome } from '../../context/MetronomeProvider';

const TempoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 166px;
  margin: 0 auto;
  padding: 0 6px;
`;

const TempoButton = styled(motion.button)`
  background: none;
  color: ${props => props.theme.colors.metronome.primary};
  border: none;
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: ${props => props.theme.typography.fontFamily.base};
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  position: relative;
  z-index: 2;
  padding: 10px;

  &:disabled {
    color: ${props => props.theme.colors.metronome.primary};
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.metronome.accent};
  }

  &:active:not(:disabled) {
    color: ${props => props.theme.colors.metronome.accent};
    opacity: 0.8;
  }
`;

const TempoValue = styled.div`
  font-family: ${props => props.theme.typography.fontFamily.base};
  font-size: ${props => props.theme.typography.fontSizes.xxxl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.metronome.primary};
  min-width: 60px;
  text-align: center;
  position: relative;
  z-index: 1;
`;

const TempoDisplay: React.FC = () => {
  const { tempo, setTempo } = useMetronome();
  const { isMobile: _isMobile } = useResponsive();

  const MIN_TEMPO = 40;
  const MAX_TEMPO = 500;

  const handleTempoChange = (delta: number) => {
    const newTempo = Math.min(Math.max(tempo + delta, MIN_TEMPO), MAX_TEMPO);
    setTempo(newTempo);
  };

  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
    disabled: { opacity: 0.5 },
  };

  return (
    <TempoContainer>
      <TempoButton
        onClick={() => handleTempoChange(-1)}
        disabled={tempo <= MIN_TEMPO}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        animate={tempo <= MIN_TEMPO ? 'disabled' : ''}
      >
        -
      </TempoButton>
      <TempoValue>{tempo}</TempoValue>
      <TempoButton
        onClick={() => handleTempoChange(1)}
        disabled={tempo >= MAX_TEMPO}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        animate={tempo >= MAX_TEMPO ? 'disabled' : ''}
      >
        +
      </TempoButton>
    </TempoContainer>
  );
};

export default TempoDisplay;
