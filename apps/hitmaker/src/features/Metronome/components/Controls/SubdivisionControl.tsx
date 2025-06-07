// src/features/Metronome/components/Controls/SubdivisionControl.tsx

import React, { useState, useMemo } from 'react';

import { Subdivision } from '../../types';
import { AnimationWrapper } from '../AnimationWrapper';

import { DisplayButton, SubdivisionList, SubdivisionOption, SubdivisionContainer } from './styles';

interface SubdivisionControlProps {
  subdivision: Subdivision;
  changeSubdivision: (subdivision: Subdivision) => void;
}

interface SubdivisionOptionType {
  value: Subdivision;
  display: string;
  image: string;
}

const subdivisionOptions: SubdivisionOptionType[] = [
  { value: '1', display: 'Quarter', image: '/assets/images/quarter-note-subdivision.svg' },
  { value: '2', display: 'Eighth', image: '/assets/images/eighth-note-subdivision.svg' },
];

const getSubdivisionLabel = (subdivision: Subdivision): string => {
  const option = subdivisionOptions.find(opt => opt.value === subdivision);
  return option ? option.display : subdivision;
};

export const SubdivisionControl: React.FC<SubdivisionControlProps> = ({
  subdivision,
  changeSubdivision,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel = getSubdivisionLabel(subdivision);

  // Filter out the currently selected subdivision
  const availableOptions = useMemo(
    () => subdivisionOptions.filter(option => option.value !== subdivision),
    [subdivision]
  );

  const handleSelect = (option: SubdivisionOptionType) => {
    changeSubdivision(option.value);
    setIsOpen(false);
  };

  // Animation variants
  const listVariants = {
    hidden: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.1 },
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.01,
        when: 'beforeChildren',
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.1 },
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
    <SubdivisionContainer role="group" aria-label="Subdivision controls">
      <DisplayButton
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <img
          src={subdivisionOptions.find(opt => opt.value === subdivision)?.image}
          alt={currentLabel}
          width="42"
          height="42"
        />
      </DisplayButton>

      <AnimationWrapper>
        {isOpen && (
          <SubdivisionList
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={listVariants}
            role="listbox"
            aria-label="Subdivision options"
          >
            {availableOptions.map(option => (
              <SubdivisionOption
                key={option.value}
                variants={optionVariants}
                selected={false}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={false}
              >
                <img src={option.image} alt={option.display} width="42" height="42" />
              </SubdivisionOption>
            ))}
          </SubdivisionList>
        )}
      </AnimationWrapper>
    </SubdivisionContainer>
  );
};
