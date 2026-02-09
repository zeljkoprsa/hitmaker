// src/features/Metronome/components/Controls/TimeSignatureControl.tsx

import React, { useState, useMemo } from 'react';

import { TimeSignature } from '../../../../core/types/MetronomeTypes';
import { AnimationWrapper } from '../AnimationWrapper';

import {
  DisplayButton,
  TimeSignatureList,
  TimeSignatureOption,
  TimeSignatureContainer,
} from './styles';

interface TimeSignatureOption {
  beats: number;
  noteValue: number;
  display: string;
}

const timeSignatureOptions: TimeSignatureOption[] = [
  { beats: 4, noteValue: 4, display: '4/4' },
  { beats: 3, noteValue: 4, display: '3/4' },
  { beats: 2, noteValue: 4, display: '2/4' },
  { beats: 1, noteValue: 4, display: '1/4' },
  { beats: 2, noteValue: 2, display: '2/2' },
  { beats: 6, noteValue: 8, display: '6/8' },
  { beats: 9, noteValue: 8, display: '9/8' },
  { beats: 12, noteValue: 8, display: '12/8' },
  { beats: 5, noteValue: 4, display: '5/4' },
  { beats: 7, noteValue: 8, display: '7/8' },
];

interface TimeSignatureControlProps {
  timeSignature: TimeSignature;
  changeTimeSignature: (beats: number, noteValue: number) => void;
}

export const TimeSignatureControl: React.FC<TimeSignatureControlProps> = ({
  timeSignature,
  changeTimeSignature,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out the currently selected time signature
  const availableOptions = useMemo(
    () =>
      timeSignatureOptions.filter(
        option =>
          !(option.beats === timeSignature.beats && option.noteValue === timeSignature.noteValue)
      ),
    [timeSignature.beats, timeSignature.noteValue]
  );

  const handleSelect = (option: TimeSignatureOption) => {
    changeTimeSignature(option.beats, option.noteValue);
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
        duration: 0.2,
        staggerChildren: 0.02,
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
    <TimeSignatureContainer role="group" aria-label="Time signature controls">
      <DisplayButton
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>
          {timeSignature.beats}/{timeSignature.noteValue}
        </span>
      </DisplayButton>

      <AnimationWrapper>
        {isOpen && (
          <TimeSignatureList
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={listVariants}
            role="listbox"
            aria-label="Time signature options"
          >
            {availableOptions.map(option => (
              <TimeSignatureOption
                key={option.display}
                variants={optionVariants}
                selected={false}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={false}
              >
                <span>{option.display}</span>
              </TimeSignatureOption>
            ))}
          </TimeSignatureList>
        )}
      </AnimationWrapper>
    </TimeSignatureContainer>
  );
};
