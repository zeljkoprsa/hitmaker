import React, { useState, useEffect, useRef } from 'react';

import { getSoundById, SOUNDS } from '../../../../../core/types/SoundTypes';
import { AnimationWrapper } from '../../AnimationWrapper';
import { DisplayButton } from '../styles';

import {
  SoundSelectorContainer,
  DropdownPanel,
  SoundGrid,
  SoundCard,
  SoundName,
  CheckIcon,
} from './styles';

interface SoundSelectorProps {
  currentSoundId: string;
  onSoundChange: (soundId: string) => void;
  isLoading: boolean;
}

export const SoundSelector: React.FC<SoundSelectorProps> = ({
  currentSoundId,
  onSoundChange,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSound = getSoundById(currentSoundId);
  const currentLabel = currentSound?.name || 'Sound';

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleSelect = (soundId: string) => {
    onSoundChange(soundId);
    setIsOpen(false);
  };

  return (
    <SoundSelectorContainer ref={containerRef}>
      <DisplayButton
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-label="Select sound"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{isLoading ? '...' : currentLabel}</span>
      </DisplayButton>

      <AnimationWrapper mode="wait">
        {isOpen && (
          <DropdownPanel
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <SoundGrid>
              {SOUNDS.map(sound => (
                <SoundCard
                  key={sound.id}
                  onClick={() => handleSelect(sound.id)}
                  isSelected={sound.id === currentSoundId}
                  role="option"
                  aria-selected={sound.id === currentSoundId}
                >
                  <SoundName>{sound.name}</SoundName>
                  {sound.id === currentSoundId && <CheckIcon>✓</CheckIcon>}
                </SoundCard>
              ))}
            </SoundGrid>
          </DropdownPanel>
        )}
      </AnimationWrapper>
    </SoundSelectorContainer>
  );
};
