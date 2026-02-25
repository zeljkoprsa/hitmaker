// src/features/Metronome/components/Controls/TimeSignatureControl.tsx

import React, { useMemo } from 'react';

import { TimeSignature } from '../../../../core/types/MetronomeTypes';

import { PickerOption, ScrollPickerMenu } from './ScrollPickerMenu';
import { TimeSignatureContainer } from './styles';

interface TimeSignatureOptionDef {
  beats: number;
  noteValue: number;
  display: string;
}

const timeSignatureOptions: TimeSignatureOptionDef[] = [
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

const getIsSelected = (opt: PickerOption<TimeSignature>, val: TimeSignature): boolean =>
  opt.value.beats === val.beats && opt.value.noteValue === val.noteValue;

export const TimeSignatureControl: React.FC<TimeSignatureControlProps> = ({
  timeSignature,
  changeTimeSignature,
}) => {
  const options = useMemo(
    (): PickerOption<TimeSignature>[] =>
      timeSignatureOptions.map(opt => ({
        value: { beats: opt.beats, noteValue: opt.noteValue },
        renderItem: () => <span>{opt.display}</span>,
        ariaLabel: `Time signature ${opt.display}`,
      })),
    []
  );

  return (
    <TimeSignatureContainer role="group" aria-label="Time signature">
      <ScrollPickerMenu
        options={options}
        selectedValue={timeSignature}
        onSelect={val => changeTimeSignature(val.beats, val.noteValue)}
        getIsSelected={getIsSelected}
      />
    </TimeSignatureContainer>
  );
};
