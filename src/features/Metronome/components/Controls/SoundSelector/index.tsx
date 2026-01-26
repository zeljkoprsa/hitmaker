import React, { useState, useEffect, useRef } from 'react';

import { getSoundById, SOUNDS } from '../../../../../core/types/SoundTypes';
import { AnimationWrapper } from '../../AnimationWrapper';

import {
  SoundSelectorContainer,
  SoundButton,
  SoundLabel,
  DropdownPanel,
  SoundGrid,
  SoundCard,
  SoundName,
  CheckIcon,
  PreviewButton,
  PlayIcon,
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
  const [previewingId, setPreviewingId] = useState<string | null>(null);
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

  const handlePreview = (e: React.MouseEvent, soundId: string) => {
    e.stopPropagation();
    // TODO: Implement sound preview
    setPreviewingId(soundId);
    setTimeout(() => setPreviewingId(null), 300);
  };

  return (
    <SoundSelectorContainer ref={containerRef}>
      <SoundButton
        onClick={() => setIsOpen(!isOpen)}
        isOpen={isOpen}
        disabled={isLoading}
        aria-label="Select sound"
        aria-expanded={isOpen}
      >
        <SoundLabel>{isLoading ? 'Loading...' : currentLabel}</SoundLabel>
      </SoundButton>

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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {sound.id === currentSoundId && (
                    <CheckIcon
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      ✓
                    </CheckIcon>
                  )}
                  <PreviewButton
                    onClick={e => handlePreview(e, sound.id)}
                    isPreviewing={previewingId === sound.id}
                    aria-label={`Preview ${sound.name}`}
                  >
                    <PlayIcon isPreviewing={previewingId === sound.id}>▶</PlayIcon>
                  </PreviewButton>
                  <SoundName>{sound.name}</SoundName>
                </SoundCard>
              ))}
            </SoundGrid>
          </DropdownPanel>
        )}
      </AnimationWrapper>
    </SoundSelectorContainer>
  );
};
