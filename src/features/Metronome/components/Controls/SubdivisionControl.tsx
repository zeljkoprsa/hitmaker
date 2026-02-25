// src/features/Metronome/components/Controls/SubdivisionControl.tsx

import React, { useMemo } from 'react';

import { SubdivisionType } from '../../../../core/types/MetronomeTypes';

import { PickerOption, ScrollPickerMenu } from './ScrollPickerMenu';
import { SubdivisionContainer } from './styles';

interface SubdivisionOptionDef {
  value: SubdivisionType;
  display: string;
  image: string;
}

const subdivisionOptions: SubdivisionOptionDef[] = [
  { value: 'quarter', display: 'Quarter', image: '/assets/images/quarter-note-subdivision.svg' },
  { value: 'eighth', display: 'Eighth', image: '/assets/images/eighth-note-subdivision.svg' },
  { value: 'sixteenth', display: '16th', image: '/assets/images/sixteenth-note-subdivision.svg' },
];

interface SubdivisionControlProps {
  subdivision: SubdivisionType;
  changeSubdivision: (subdivision: SubdivisionType) => void;
}

const getIsSelected = (opt: PickerOption<SubdivisionType>, val: SubdivisionType): boolean =>
  opt.value === val;

export const SubdivisionControl: React.FC<SubdivisionControlProps> = ({
  subdivision,
  changeSubdivision,
}) => {
  const options = useMemo(
    (): PickerOption<SubdivisionType>[] =>
      subdivisionOptions.map(opt => ({
        value: opt.value,
        renderItem: () => <img src={opt.image} alt={opt.display} width="42" height="42" />,
        ariaLabel: `${opt.display} notes subdivision`,
      })),
    []
  );

  return (
    <SubdivisionContainer role="group" aria-label="Subdivision">
      <ScrollPickerMenu
        options={options}
        selectedValue={subdivision}
        onSelect={changeSubdivision}
        getIsSelected={getIsSelected}
      />
    </SubdivisionContainer>
  );
};
