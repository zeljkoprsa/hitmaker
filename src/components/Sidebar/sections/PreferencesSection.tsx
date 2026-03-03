import styled from '@emotion/styled';
import React from 'react';

import { useMetronome } from '../../../features/Metronome/context/MetronomeProvider';
import { SOUNDS } from '../../../core/types/SoundTypes';
import { usePreferences } from '../../../hooks/usePreferences';
import { SectionHeader } from '../styles';

const PrefList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
`;

const PrefItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
`;

const PrefLabel = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const PrefValue = styled.span`
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

const ExportButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.5);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 10px;
  min-height: 44px;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
    color: ${({ theme }) => theme.colors.metronome.primary};
  }

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SoundLabel = styled.span`
  display: block;
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-bottom: 8px;
`;

const SoundGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-bottom: 14px;
`;

const SoundChip = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.05)'};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: ${({ $active }) => ($active ? '#fff' : 'rgba(255,255,255,0.55)')};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 8px 4px;
  min-height: 44px;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:active {
    opacity: 0.8;
  }
`;

const PreferencesSection: React.FC = () => {
  const { tempo, timeSignature, soundId, setSound } = useMetronome();
  const { preferences } = usePreferences();

  const handleExport = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'metronome_preferences.json');
    link.click();
  };

  return (
    <>
      <SectionHeader>Preferences</SectionHeader>
      <PrefList>
        <PrefItem>
          <PrefLabel>Tempo</PrefLabel>
          <PrefValue>{tempo} BPM</PrefValue>
        </PrefItem>
        <PrefItem>
          <PrefLabel>Time Signature</PrefLabel>
          <PrefValue>
            {timeSignature.beats}/{timeSignature.noteValue}
          </PrefValue>
        </PrefItem>
      </PrefList>
      <SoundLabel>Sound</SoundLabel>
      <SoundGrid>
        {SOUNDS.map((sound) => (
          <SoundChip
            key={sound.id}
            $active={soundId === sound.id}
            onClick={() => setSound(sound.id)}
          >
            {sound.name}
          </SoundChip>
        ))}
      </SoundGrid>
      <ExportButton onClick={handleExport}>Export Preferences</ExportButton>
    </>
  );
};

export default PreferencesSection;
