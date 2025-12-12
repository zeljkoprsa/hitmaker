// src/features/Metronome/components/Controls/StartStopButton.tsx

import { motion } from 'framer-motion';
import React from 'react';

import { AnimationWrapper } from '../AnimationWrapper';

import { StartStopButtonStyled } from './styles';

interface StartStopButtonProps {
  isPlaying: boolean;
  togglePlay: () => Promise<void>;
}

const IconMotion = motion.div;

export const StartStopButton: React.FC<StartStopButtonProps> = ({ isPlaying, togglePlay }) => {
  return (
    <StartStopButtonStyled
      isPlaying={isPlaying}
      onClick={togglePlay}
      aria-label={isPlaying ? 'Stop' : 'Start'}
    >
      <AnimationWrapper mode="wait">
        <IconMotion
          key={isPlaying ? 'pause' : 'play'}
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${
              isPlaying
                ? '/assets/images/pause-button_metronome.svg'
                : '/assets/images/play-button_metronome.svg'
            })`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        />
      </AnimationWrapper>
    </StartStopButtonStyled>
  );
};
