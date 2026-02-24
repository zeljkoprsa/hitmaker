import styled from '@emotion/styled';
import React, { useState } from 'react';

import { useSession } from '../../context/SessionContext';
import { SubdivisionType, TimeSignature } from '../../core/types/MetronomeTypes';
import { PracticeSession, SessionBlock } from '../../core/types/SessionTypes';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';

interface SessionEditorProps {
  session: PracticeSession | null;
  onSave: () => void;
  onCancel: () => void;
}

const TIME_SIG_OPTIONS: TimeSignature[] = [
  { beats: 4, noteValue: 4 },
  { beats: 3, noteValue: 4 },
  { beats: 2, noteValue: 4 },
  { beats: 2, noteValue: 2 },
  { beats: 6, noteValue: 8 },
  { beats: 9, noteValue: 8 },
  { beats: 12, noteValue: 8 },
  { beats: 5, noteValue: 4 },
  { beats: 7, noteValue: 8 },
];

const SUB_OPTIONS: { value: SubdivisionType; label: string }[] = [
  { value: 'quarter', label: 'Quarter' },
  { value: 'eighth', label: 'Eighth' },
  { value: 'triplet', label: 'Triplet' },
  { value: 'sixteenth', label: '16th' },
];

const tsKey = (ts: TimeSignature) => `${ts.beats}/${ts.noteValue}`;
const parseTs = (val: string): TimeSignature => {
  const [b, n] = val.split('/').map(Number);
  return { beats: b, noteValue: n };
};

// Styled components
const NameInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  outline: none;
  margin-bottom: 16px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
    font-weight: 400;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    box-shadow: 0 0 0 2px rgba(246, 65, 5, 0.12);
  }
`;

const BlockList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
`;

const BlockCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const BlockNumber = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.3);
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  flex-shrink: 0;
  min-width: 20px;
`;

const LabelInput = styled.input`
  flex: 1;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 5px 8px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  outline: none;
  min-height: 30px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const MoveBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  padding: 4px 5px;
  font-size: 13px;
  line-height: 1;
  min-height: 28px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};

  &:hover:not(:disabled) {
    color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.06);
  }

  &:disabled {
    opacity: 0.15;
    cursor: default;
  }
`;

const DeleteBlockBtn = styled(MoveBtn)`
  &:hover {
    color: var(--color-error, #ff4d4f) !important;
    background: rgba(255, 77, 79, 0.08) !important;
  }
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 3px;
`;

const NumberInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 5px 8px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  outline: none;
  min-height: 30px;

  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 5px 8px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  outline: none;
  min-height: 30px;
  cursor: pointer;

  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
  }

  option {
    background: #1c1c1c;
  }
`;

const AddBlockBtn = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.35);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  cursor: pointer;
  padding: 10px;
  min-height: 40px;
  transition:
    color 150ms ease,
    border-color 150ms ease;

  &:hover {
    color: rgba(255, 255, 255, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
  }
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
  margin-top: 12px;
`;

const SaveBtn = styled.button`
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

  &:hover {
    opacity: 0.9;
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

const newBlock = (tempo: number, ts: TimeSignature, sub: SubdivisionType): SessionBlock => ({
  id: crypto.randomUUID(),
  label: '',
  tempo,
  timeSignature: ts,
  subdivision: sub,
  durationMinutes: 5,
});

const SessionEditor: React.FC<SessionEditorProps> = ({ session, onSave, onCancel }) => {
  const { createSession, updateSession } = useSession();
  const { tempo, timeSignature, subdivision } = useMetronome();

  const [name, setName] = useState(session?.name ?? '');
  const [blocks, setBlocks] = useState<SessionBlock[]>(
    session ? session.blocks.map(b => ({ ...b })) : []
  );
  const [error, setError] = useState<string | null>(null);

  const updateBlock = (index: number, changes: Partial<SessionBlock>) => {
    setBlocks(prev => prev.map((b, i) => (i === index ? { ...b, ...changes } : b)));
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    setBlocks(prev => {
      const next = [...prev];
      const swap = index + dir;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  };

  const removeBlock = (index: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const addBlock = () => {
    setBlocks(prev => [...prev, newBlock(tempo, timeSignature, subdivision)]);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Session name is required.');
      return;
    }
    if (blocks.length === 0) {
      setError('Add at least one block.');
      return;
    }
    if (session) {
      updateSession(session.id, { name: trimmed, blocks });
    } else {
      createSession({ name: trimmed, blocks });
    }
    onSave();
  };

  return (
    <>
      <NameInput
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Session name"
        autoFocus
      />

      <BlockList>
        {blocks.map((block, i) => (
          <BlockCard key={block.id}>
            <BlockHeader>
              <BlockNumber>{i + 1}</BlockNumber>
              <LabelInput
                value={block.label ?? ''}
                onChange={e => updateBlock(i, { label: e.target.value })}
                placeholder="Label (optional)"
              />
              <MoveBtn onClick={() => moveBlock(i, -1)} disabled={i === 0} title="Move up">
                ↑
              </MoveBtn>
              <MoveBtn
                onClick={() => moveBlock(i, 1)}
                disabled={i === blocks.length - 1}
                title="Move down"
              >
                ↓
              </MoveBtn>
              <DeleteBlockBtn onClick={() => removeBlock(i)} title="Remove">
                ✕
              </DeleteBlockBtn>
            </BlockHeader>

            <FieldGrid>
              <div>
                <FieldLabel>Tempo</FieldLabel>
                <NumberInput
                  type="number"
                  min={30}
                  max={500}
                  value={block.tempo}
                  onChange={e => updateBlock(i, { tempo: Number(e.target.value) })}
                />
              </div>
              <div>
                <FieldLabel>Time Sig</FieldLabel>
                <Select
                  value={tsKey(block.timeSignature)}
                  onChange={e => updateBlock(i, { timeSignature: parseTs(e.target.value) })}
                >
                  {TIME_SIG_OPTIONS.map(ts => (
                    <option key={tsKey(ts)} value={tsKey(ts)}>
                      {tsKey(ts)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel>Subdivision</FieldLabel>
                <Select
                  value={block.subdivision}
                  onChange={e => updateBlock(i, { subdivision: e.target.value as SubdivisionType })}
                >
                  {SUB_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel>Duration (min)</FieldLabel>
                <NumberInput
                  type="number"
                  min={0.5}
                  max={120}
                  step={0.5}
                  value={block.durationMinutes}
                  onChange={e => updateBlock(i, { durationMinutes: Number(e.target.value) })}
                />
              </div>
            </FieldGrid>
          </BlockCard>
        ))}
      </BlockList>

      <AddBlockBtn onClick={addBlock}>+ Add block from current settings</AddBlockBtn>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Footer>
        <CancelBtn onClick={onCancel}>Cancel</CancelBtn>
        <SaveBtn onClick={handleSave}>Save</SaveBtn>
      </Footer>
    </>
  );
};

export default SessionEditor;
