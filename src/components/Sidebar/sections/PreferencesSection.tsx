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

const RowLabel = styled.span`
  display: block;
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-bottom: 8px;
`;

/* ── Volume ── */

const VolumeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
`;

const MuteButton = styled.button<{ $muted: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $muted, theme }) =>
    $muted ? theme.colors.metronome.accent : 'rgba(255,255,255,0.45)'};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  transition: color 150ms ease;

  &:active {
    opacity: 0.7;
  }
`;

const VolumeSlider = styled.input<{ $pct: number; $muted: boolean }>`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  outline: none;
  cursor: ${({ $muted }) => ($muted ? 'not-allowed' : 'pointer')};
  opacity: ${({ $muted }) => ($muted ? 0.35 : 1)};
  background: linear-gradient(
    to right,
    #f64105 ${({ $pct }) => $pct}%,
    rgba(255, 255, 255, 0.12) ${({ $pct }) => $pct}%
  );
  transition: opacity 150ms ease;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    cursor: ${({ $muted }) => ($muted ? 'not-allowed' : 'pointer')};
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: none;
    background: #fff;
    cursor: ${({ $muted }) => ($muted ? 'not-allowed' : 'pointer')};
  }
`;

const VolumeValue = styled.span`
  color: rgba(255, 255, 255, 0.3);
  font-size: 11px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  min-width: 30px;
  text-align: right;
  flex-shrink: 0;
`;

/* ── Sound ── */

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

/* ── Icons ── */

const SpeakerOnIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 5.5h2.5L8 3v10L4.5 10.5H2V5.5z" />
    <path
      d="M10 5.5a3 3 0 010 5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const SpeakerOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 5.5h2.5L8 3v10L4.5 10.5H2V5.5z" />
    <path
      d="M10.5 5.5l3 3M13.5 5.5l-3 3"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Component ── */

const PreferencesSection: React.FC = () => {
  const { tempo, timeSignature, soundId, setSound, volume, muted, setVolume, setMuted } =
    useMetronome();
  const { preferences } = usePreferences();

  const pct = Math.round(volume * 100);

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

      <RowLabel>Volume</RowLabel>
      <VolumeRow>
        <MuteButton
          $muted={muted}
          onClick={() => setMuted(!muted)}
          aria-label={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <SpeakerOffIcon /> : <SpeakerOnIcon />}
        </MuteButton>
        <VolumeSlider
          type="range"
          min={0}
          max={100}
          value={pct}
          $pct={pct}
          $muted={muted}
          disabled={muted}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          aria-label="Volume"
        />
        <VolumeValue>{muted ? 'Off' : `${pct}%`}</VolumeValue>
      </VolumeRow>

      <RowLabel>Sound</RowLabel>
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
