import styled from '@emotion/styled';
import React, { useMemo, useState } from 'react';

import { useSession } from '../../context/SessionContext';
import { SubdivisionType, TimeSignature } from '../../core/types/MetronomeTypes';
import { PracticeSession, SessionBlock } from '../../core/types/SessionTypes';
import {
  blocksSummary,
  copySectionBlocks,
  copyWorkoutBlocks,
  moveEntry,
  removeEntry,
  toEditorEntries,
} from '../../core/utils/composeSession';
import { useCatalog } from '../../features/Catalog/useCatalog';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';
import { NumberField } from '../NumberField';
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, XIcon } from '../Sidebar/icons';

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

const NumberInput = styled(NumberField)`
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

/** One picked component (lesson section / workout): a single card that
 *  moves and removes as a unit. Internals aren't editable here — tuning
 *  section content stays in the lesson data (spec #5 scope). */
const ComponentCard = styled.div`
  background: rgba(246, 65, 5, 0.05);
  border: 1px solid rgba(246, 65, 5, 0.2);
  border-left: 3px solid ${({ theme }) => theme.colors.metronome.accent};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ComponentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ComponentLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ComponentMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: rgba(255, 255, 255, 0.35);
  margin-top: 2px;
`;

const PickerPanel = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PickerGroup = styled.div`
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  padding: 8px 2px 4px;
`;

const PickerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 2px;
`;

const PickerInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PickerName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.metronome.primary};
`;

const PickerMeta = styled.div`
  font-size: 10px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: rgba(255, 255, 255, 0.3);
`;

const PickerAddBtn = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.metronome.accent};
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    color: white;
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
  const catalogItems = useCatalog();

  const [name, setName] = useState(session?.name ?? '');
  const [blocks, setBlocks] = useState<SessionBlock[]>(
    session ? session.blocks.map(b => ({ ...b })) : []
  );
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Editor operates on entries: a picked component (lesson section /
  // workout) is one unit; hand-built blocks are individual as before
  const entries = useMemo(() => toEditorEntries(blocks), [blocks]);

  const updateBlock = (id: string, changes: Partial<SessionBlock>) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...changes } : b)));
  };

  const handleMoveEntry = (index: number, dir: -1 | 1) => {
    setBlocks(moveEntry(entries, index, dir));
  };

  const handleRemoveEntry = (index: number) => {
    setBlocks(removeEntry(entries, index));
  };

  const addBlock = () => {
    setBlocks(prev => [...prev, newBlock(tempo, timeSignature, subdivision)]);
  };

  const addComponent = (copied: SessionBlock[]) => {
    setBlocks(prev => [...prev, ...copied]);
  };

  // Picker contents: lessons expose their named sections; workouts go whole.
  // Structural blocks (rests, outros) are in no section — never offered.
  const lessonItems = catalogItems.filter(c => c.type === 'lesson' && c.session?.sections?.length);
  const workoutItems = catalogItems.filter(c => c.type === 'workout' && c.session);

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
        {entries.map((entry, i) => {
          const moveButtons = (
            <>
              <MoveBtn onClick={() => handleMoveEntry(i, -1)} disabled={i === 0} title="Move up">
                <ChevronUpIcon size={14} />
              </MoveBtn>
              <MoveBtn
                onClick={() => handleMoveEntry(i, 1)}
                disabled={i === entries.length - 1}
                title="Move down"
              >
                <ChevronDownIcon size={14} />
              </MoveBtn>
              <DeleteBlockBtn onClick={() => handleRemoveEntry(i)} title="Remove">
                <XIcon size={14} />
              </DeleteBlockBtn>
            </>
          );

          if (entry.kind === 'component') {
            return (
              <ComponentCard key={entry.componentId}>
                <BlockNumber>{i + 1}</BlockNumber>
                <ComponentInfo>
                  <ComponentLabel>{entry.label}</ComponentLabel>
                  <ComponentMeta>{blocksSummary(entry.blocks)}</ComponentMeta>
                </ComponentInfo>
                {moveButtons}
              </ComponentCard>
            );
          }

          const block = entry.block;
          return (
            <BlockCard key={block.id}>
              <BlockHeader>
                <BlockNumber>{i + 1}</BlockNumber>
                <LabelInput
                  value={block.label ?? ''}
                  onChange={e => updateBlock(block.id, { label: e.target.value })}
                  placeholder="Label (optional)"
                />
                {moveButtons}
              </BlockHeader>

              <FieldGrid>
                <div>
                  <FieldLabel>Tempo</FieldLabel>
                  <NumberInput
                    min={30}
                    max={500}
                    value={block.tempo ?? 120}
                    onCommit={v => updateBlock(block.id, { tempo: v })}
                  />
                </div>
                <div>
                  <FieldLabel>Time Sig</FieldLabel>
                  <Select
                    value={tsKey(block.timeSignature ?? { beats: 4, noteValue: 4 })}
                    onChange={e =>
                      updateBlock(block.id, { timeSignature: parseTs(e.target.value) })
                    }
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
                    onChange={e =>
                      updateBlock(block.id, { subdivision: e.target.value as SubdivisionType })
                    }
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
                    min={0.5}
                    max={120}
                    step={0.5}
                    allowDecimal
                    value={block.durationMinutes}
                    onCommit={v => updateBlock(block.id, { durationMinutes: v })}
                  />
                </div>
              </FieldGrid>
            </BlockCard>
          );
        })}
      </BlockList>

      <AddBlockBtn onClick={() => setPickerOpen(o => !o)}>
        {pickerOpen ? '− Close catalog picker' : '+ Add from Catalog'}
      </AddBlockBtn>

      {pickerOpen && (
        <PickerPanel>
          {lessonItems.map(item => (
            <React.Fragment key={item.id}>
              <PickerGroup>{item.title}</PickerGroup>
              {item.session!.sections!.map(section => {
                const sectionBlocks = item.session!.blocks.filter(b =>
                  section.blockIds.includes(b.id)
                );
                return (
                  <PickerRow key={section.id}>
                    <PickerInfo>
                      <PickerName>{section.name}</PickerName>
                      <PickerMeta>{blocksSummary(sectionBlocks)}</PickerMeta>
                    </PickerInfo>
                    <PickerAddBtn
                      onClick={() => addComponent(copySectionBlocks(item.session!, section))}
                      aria-label={`Add ${section.name} from ${item.title}`}
                    >
                      <PlusIcon size={12} />
                    </PickerAddBtn>
                  </PickerRow>
                );
              })}
            </React.Fragment>
          ))}

          <PickerGroup>Workouts</PickerGroup>
          {workoutItems.map(item => (
            <PickerRow key={item.id}>
              <PickerInfo>
                <PickerName>{item.title}</PickerName>
                <PickerMeta>{blocksSummary(item.session!.blocks)}</PickerMeta>
              </PickerInfo>
              <PickerAddBtn
                onClick={() => addComponent(copyWorkoutBlocks(item.session!))}
                aria-label={`Add ${item.title} workout`}
              >
                <PlusIcon size={12} />
              </PickerAddBtn>
            </PickerRow>
          ))}
        </PickerPanel>
      )}

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
