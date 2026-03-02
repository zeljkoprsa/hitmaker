import styled from '@emotion/styled';
import React, { useMemo, useState } from 'react';

import { useSession } from '../../context/SessionContext';
import { SubdivisionType } from '../../core/types/MetronomeTypes';
import {
  TEMPO_TRAINER_PRESETS,
  TempoTrainerPreset,
  generateTrainerSession,
} from '../../features/Sessions/tempoTrainerPresets';
import { SectionHeader } from '../Sidebar/styles';

interface TempoTrainerFormProps {
  onStart: () => void;
  onCancel: () => void;
}

// --- Styled components ---

const PresetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

const PresetCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 10px 12px;
  gap: 10px;
`;

const PresetInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const PresetName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PresetMeta = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.35);
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

const PresetStartBtn = styled.button`
  background: ${({ theme }) => theme.colors.metronome.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  padding: 6px 10px;
  min-height: 30px;
  flex-shrink: 0;
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.85;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
`;

const FieldLabel = styled.label`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 4px;
`;

const NumberInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 6px 8px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  outline: none;
  min-height: 34px;

  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SubdivisionRow = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
`;

const SubBtn = styled.button<{ active: boolean }>`
  flex: 1;
  background: ${({ active }) => (active ? 'rgba(246, 65, 5, 0.15)' : 'rgba(255, 255, 255, 0.03)')};
  border: 1px solid
    ${({ active }) => (active ? 'rgba(246, 65, 5, 0.5)' : 'rgba(255, 255, 255, 0.08)')};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: ${({ active, theme }) =>
    active ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.4)'};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  padding: 7px 4px;
  min-height: 34px;
  transition:
    background 150ms ease,
    border-color 150ms ease,
    color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const PreviewLine = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

const ErrorMsg = styled.p`
  color: var(--color-error, #ff4d4f);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  margin: 0 0 10px;
`;

const Footer = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 4px;
`;

const StartBtn = styled.button`
  flex: 1;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.metronome.accent} 0%,
    #d63a04 100%
  );
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  padding: 10px;
  min-height: 44px;
  transition: opacity 150ms ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const CancelBtn = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  cursor: pointer;
  padding: 10px 16px;
  min-height: 44px;
  transition: background-color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }
`;

const SubLabel = styled.label`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 6px;
`;

// --- Constants ---

const SUB_OPTIONS: { value: SubdivisionType; label: string }[] = [
  { value: 'quarter', label: 'Quarter' },
  { value: 'eighth', label: 'Eighth' },
  { value: 'sixteenth', label: '16th' },
];

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

const presetMeta = (p: TempoTrainerPreset): string => {
  const blockCount = Math.floor((p.endBpm - p.startBpm) / p.increment) + 1;
  const totalMin = blockCount * p.minutesPerBlock;
  return `${blockCount} blocks · ${totalMin} min`;
};

// --- Component ---

const TempoTrainerForm: React.FC<TempoTrainerFormProps> = ({ onStart, onCancel }) => {
  const { startSession } = useSession();

  const [startBpm, setStartBpm] = useState(60);
  const [endBpm, setEndBpm] = useState(120);
  const [increment, setIncrement] = useState(5);
  const [minutesPerBlock, setMinutesPerBlock] = useState(2);
  const [subdivision, setSubdivision] = useState<SubdivisionType>('quarter');

  const { blockCount, totalMin, error } = useMemo(() => {
    if (endBpm < startBpm) {
      return { blockCount: 0, totalMin: 0, error: 'End BPM must be ≥ Start BPM.' };
    }
    const count = Math.floor((endBpm - startBpm) / increment) + 1;
    if (count > 50) {
      return {
        blockCount: count,
        totalMin: 0,
        error: `Too many blocks (${count}). Increase increment or reduce BPM range.`,
      };
    }
    return { blockCount: count, totalMin: count * minutesPerBlock, error: null };
  }, [startBpm, endBpm, increment, minutesPerBlock]);

  const handlePresetStart = (preset: TempoTrainerPreset) => {
    startSession(generateTrainerSession(preset));
    onStart();
  };

  const handleStart = () => {
    if (error) return;
    startSession(
      generateTrainerSession({
        id: '',
        name: `${startBpm}→${endBpm} BPM`,
        description: '',
        startBpm,
        endBpm,
        increment,
        minutesPerBlock,
        subdivision,
      })
    );
    onStart();
  };

  return (
    <>
      <SectionHeader>Presets</SectionHeader>
      <PresetList>
        {TEMPO_TRAINER_PRESETS.map(preset => (
          <PresetCard key={preset.id}>
            <PresetInfo>
              <PresetName>{preset.name}</PresetName>
              <PresetMeta>
                {preset.description} · {presetMeta(preset)}
              </PresetMeta>
            </PresetInfo>
            <PresetStartBtn onClick={() => handlePresetStart(preset)}>Start</PresetStartBtn>
          </PresetCard>
        ))}
      </PresetList>

      <SectionHeader style={{ marginTop: 4 }}>Custom</SectionHeader>

      <FieldGrid>
        <div>
          <FieldLabel htmlFor="tt-start">Start BPM</FieldLabel>
          <NumberInput
            id="tt-start"
            type="number"
            min={30}
            max={300}
            value={startBpm}
            onChange={e => setStartBpm(clamp(Number(e.target.value), 30, 300))}
          />
        </div>
        <div>
          <FieldLabel htmlFor="tt-end">End BPM</FieldLabel>
          <NumberInput
            id="tt-end"
            type="number"
            min={30}
            max={300}
            value={endBpm}
            onChange={e => setEndBpm(clamp(Number(e.target.value), 30, 300))}
          />
        </div>
        <div>
          <FieldLabel htmlFor="tt-inc">Increment (BPM)</FieldLabel>
          <NumberInput
            id="tt-inc"
            type="number"
            min={1}
            max={50}
            value={increment}
            onChange={e => setIncrement(clamp(Number(e.target.value), 1, 50))}
          />
        </div>
        <div>
          <FieldLabel htmlFor="tt-dur">Minutes / block</FieldLabel>
          <NumberInput
            id="tt-dur"
            type="number"
            min={0.5}
            max={60}
            step={0.5}
            value={minutesPerBlock}
            onChange={e => setMinutesPerBlock(clamp(Number(e.target.value), 0.5, 60))}
          />
        </div>
      </FieldGrid>

      <SubLabel>Subdivision</SubLabel>
      <SubdivisionRow>
        {SUB_OPTIONS.map(opt => (
          <SubBtn
            key={opt.value}
            active={subdivision === opt.value}
            onClick={() => setSubdivision(opt.value)}
          >
            {opt.label}
          </SubBtn>
        ))}
      </SubdivisionRow>

      {error ? (
        <ErrorMsg>{error}</ErrorMsg>
      ) : (
        <PreviewLine>
          {blockCount} {blockCount === 1 ? 'block' : 'blocks'} · {startBpm}→{endBpm} BPM ·{' '}
          {totalMin} min total
        </PreviewLine>
      )}

      <Footer>
        <CancelBtn onClick={onCancel}>Cancel</CancelBtn>
        <StartBtn onClick={handleStart} disabled={!!error}>
          Start
        </StartBtn>
      </Footer>
    </>
  );
};

export default TempoTrainerForm;
