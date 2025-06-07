// src/features/Metronome/components/Controls/SoundSelector.tsx

import React, { useState, useMemo } from 'react';

import { getSoundById } from '../../../../core/types/SoundTypes';
import { AnimationWrapper } from '../AnimationWrapper';

import {
  DisplayButton,
  TimeSignatureList as SoundList,
  TimeSignatureOption as SoundOption,
  TimeSignatureContainer as SoundContainer,
} from './styles';

interface SoundSelectorProps {
  currentSoundId: string;
  onSoundChange: (soundId: string) => void;
  isLoading: boolean;
}

interface SoundOptionType {
  id: string;
  display: string;
  category: string;
}

// Limited sound options for MLP - only sample-based sounds
const soundOptions: SoundOptionType[] = [
  { id: 'metronome-quartz', display: 'Quartz', category: 'percussion' },
  { id: 'electronic-click', display: 'Klik', category: 'electronic' },
  { id: 'digital-bell', display: 'Bell', category: 'electronic' },
];

const getSoundLabel = (soundId: string): string => {
  const option = soundOptions.find(opt => opt.id === soundId);
  if (option) return option.display;

  // Fallback to getting name from the sound registry
  const sound = getSoundById(soundId);
  return sound ? sound.name : 'Sound';
};

export const SoundSelector: React.FC<SoundSelectorProps> = ({
  currentSoundId,
  onSoundChange,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel = getSoundLabel(currentSoundId);

  // Filter out the currently selected sound
  const availableOptions = useMemo(
    () => soundOptions.filter(option => option.id !== currentSoundId),
    [currentSoundId]
  );

  const handleSelect = (option: SoundOptionType) => {
    onSoundChange(option.id);
    setIsOpen(false);
  };

  // Animation variants
  const listVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
        when: 'beforeChildren',
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  const optionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <SoundContainer role="group" aria-label="Sound controls">
      <DisplayButton
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : currentLabel}
      </DisplayButton>

      <AnimationWrapper>
        {isOpen && (
          <SoundList
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={listVariants}
            role="listbox"
            aria-label="Sound options"
          >
            {availableOptions.map(option => (
              <SoundOption
                key={option.id}
                variants={optionVariants}
                selected={option.id === currentSoundId}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={option.id === currentSoundId}
                disabled={isLoading}
              >
                <span>{option.display}</span>
              </SoundOption>
            ))}
          </SoundList>
        )}
      </AnimationWrapper>
    </SoundContainer>
  );
};
