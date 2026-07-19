import styled from '@emotion/styled';
import React, { useState } from 'react';

import { LessonDraft, useLessonsStore } from '../../context/LessonsContext';
import { Lesson } from '../../core/types/LessonTypes';
import { SubdivisionType, TimeSignature } from '../../core/types/MetronomeTypes';
import {
  BlockContent,
  SessionBlock,
  SessionBlockType,
  SessionSection,
} from '../../core/types/SessionTypes';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';
import { NumberField } from '../NumberField';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from '../Sidebar/icons';

/**
 * Lesson editor (spec #7): block-granularity editing — type, tempo fields,
 * card content (eyebrow/items/prose) — plus section grouping. Sections are
 * ordered names; each block picks its section, and blockIds derive from
 * block order on save (empty sections are dropped).
 */
interface LessonEditorProps {
  /** null = new lesson */
  lesson: Lesson | null;
  /** Prefill for a new lesson (markdown import, spec #8). Only read when
   *  lesson is null; saving always creates, never updates. */
  draft?: LessonDraft;
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

const TYPE_OPTIONS: { value: SessionBlockType; label: string }[] = [
  { value: 'do', label: 'Do — exercise' },
  { value: 'teach', label: 'Teach — content' },
  { value: 'break', label: 'Break — rest' },
];

const tsKey = (ts: TimeSignature) => `${ts.beats}/${ts.noteValue}`;
const parseTs = (val: string): TimeSignature => {
  const [b, n] = val.split('/').map(Number);
  return { beats: b, noteValue: n };
};

const NO_SECTION = '__none__';

/** Editor-local block: assignment lives on the block, sections derive it
 *  back into blockIds on save. */
type EditorBlock = SessionBlock & { sectionId?: string };

const toEditorBlocks = (lesson: {
  sections?: SessionSection[];
  blocks: SessionBlock[];
}): EditorBlock[] => {
  const sectionByBlock = new Map<string, string>();
  for (const s of lesson.sections ?? []) {
    for (const id of s.blockIds) sectionByBlock.set(id, s.id);
  }
  return lesson.blocks.map(b => ({ ...b, sectionId: sectionByBlock.get(b.id) }));
};

// Styled components (per-component styles, matching SessionEditor's idiom)

const HeaderRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const NameInput = styled.input`
  flex: 1;
  min-width: 0;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
    font-weight: 400;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    box-shadow: 0 0 0 2px rgba(246, 65, 5, 0.12);
  }
`;

const NumberBadgeInput = styled(NameInput)`
  flex: 0 0 64px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  text-align: center;
`;

const GroupTitle = styled.div`
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  margin: 14px 0 6px;
`;

const SectionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
`;

const SectionNameInput = styled.input`
  flex: 1;
  min-width: 0;
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

const LabelInput = styled(SectionNameInput)``;

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

const DeleteBtn = styled(MoveBtn)`
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

const SilentToggle = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  min-height: 28px;

  input {
    accent-color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

const ContentToggle = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  cursor: pointer;
  padding: 4px 0;
  text-align: left;

  &:hover {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const ContentPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 8px;
`;

const ItemRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const Textarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 5px 8px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: inherit;
  outline: none;
  resize: vertical;
  min-height: 40px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const AddBtn = styled.button`
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

const AddSmallBtn = styled(AddBtn)`
  min-height: 30px;
  padding: 5px;
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

const DeleteLessonBtn = styled(CancelBtn)<{ armed?: boolean }>`
  color: ${({ armed }) => (armed ? 'white' : 'var(--color-error, #ff4d4f)')};
  background: ${({ armed }) => (armed ? 'var(--color-error, #ff4d4f)' : 'rgba(255, 77, 79, 0.06)')};
  border-color: rgba(255, 77, 79, 0.25);

  &:hover {
    background: ${({ armed }) => (armed ? '#d63a3c' : 'rgba(255, 77, 79, 0.12)')};
  }
`;

const move = <T,>(arr: T[], index: number, dir: -1 | 1): T[] => {
  const target = index + dir;
  if (target < 0 || target >= arr.length) return arr;
  const next = [...arr];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

/** Strip editor-only state and fields that contradict the block type. */
const sanitizeBlock = ({ sectionId, ...block }: EditorBlock): SessionBlock => {
  if (block.type === 'do' || block.type === undefined) return block;
  const { tempo, timeSignature, subdivision, ...rest } = block;
  return block.type === 'break' ? { ...rest, content: undefined } : rest;
};

const LessonEditor: React.FC<LessonEditorProps> = ({ lesson, draft, onSave, onCancel }) => {
  const { createLesson, updateLesson, deleteLesson } = useLessonsStore();
  const { tempo, timeSignature, subdivision } = useMetronome();

  // Editing an existing lesson takes precedence; otherwise an import draft
  // prefills; otherwise start blank.
  const source = lesson ?? draft ?? null;
  const [name, setName] = useState(source?.name ?? '');
  const [lessonNumber, setLessonNumber] = useState(source?.lessonNumber ?? '');
  const [sections, setSections] = useState<Array<Pick<SessionSection, 'id' | 'name'>>>(
    (source?.sections ?? []).map(s => ({ id: s.id, name: s.name }))
  );
  const [blocks, setBlocks] = useState<EditorBlock[]>(source ? toEditorBlocks(source) : []);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);

  const updateBlock = (id: string, changes: Partial<EditorBlock>) => {
    setBlocks(prev => prev.map(b => (b.id === id ? { ...b, ...changes } : b)));
  };

  const updateContent = (id: string, changes: Partial<BlockContent>) => {
    setBlocks(prev =>
      prev.map(b => (b.id === id ? { ...b, content: { ...b.content, ...changes } } : b))
    );
  };

  const addBlock = () => {
    setBlocks(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: '',
        type: 'do',
        tempo,
        timeSignature,
        subdivision,
        durationMinutes: 4,
        sectionId: sections[sections.length - 1]?.id,
      },
    ]);
  };

  const addSection = () => {
    setSections(prev => [...prev, { id: crypto.randomUUID(), name: '' }]);
  };

  const removeSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    setBlocks(prev => prev.map(b => (b.sectionId === id ? { ...b, sectionId: undefined } : b)));
  };

  const toggleContent = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Lesson name is required.');
      return;
    }
    if (blocks.length === 0) {
      setError('Add at least one block.');
      return;
    }
    const draft = {
      name: trimmed,
      lessonNumber: lessonNumber.trim() || undefined,
      blocks: blocks.map(sanitizeBlock),
      sections: sections
        .map(s => ({
          id: s.id,
          name: s.name.trim() || 'Untitled',
          blockIds: blocks.filter(b => b.sectionId === s.id).map(b => b.id),
        }))
        .filter(s => s.blockIds.length > 0),
    };
    if (lesson) {
      updateLesson(lesson.id, draft);
    } else {
      createLesson(draft);
    }
    onSave();
  };

  const handleDelete = () => {
    if (!lesson) return;
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    deleteLesson(lesson.id);
    onSave();
  };

  return (
    <>
      <HeaderRow>
        <NumberBadgeInput
          value={lessonNumber}
          onChange={e => setLessonNumber(e.target.value)}
          placeholder="№"
          aria-label="Lesson number"
        />
        <NameInput
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Lesson name"
          autoFocus
        />
      </HeaderRow>

      <GroupTitle>Sections</GroupTitle>
      {sections.map((section, i) => (
        <SectionRow key={section.id}>
          <SectionNameInput
            value={section.name}
            onChange={e =>
              setSections(prev =>
                prev.map(s => (s.id === section.id ? { ...s, name: e.target.value } : s))
              )
            }
            placeholder="Section name"
          />
          <MoveBtn onClick={() => setSections(prev => move(prev, i, -1))} disabled={i === 0}>
            <ChevronUpIcon size={14} />
          </MoveBtn>
          <MoveBtn
            onClick={() => setSections(prev => move(prev, i, 1))}
            disabled={i === sections.length - 1}
          >
            <ChevronDownIcon size={14} />
          </MoveBtn>
          <DeleteBtn onClick={() => removeSection(section.id)} title="Remove section">
            <XIcon size={14} />
          </DeleteBtn>
        </SectionRow>
      ))}
      <AddSmallBtn onClick={addSection}>+ Add section</AddSmallBtn>

      <GroupTitle>Blocks</GroupTitle>
      <BlockList>
        {blocks.map((block, i) => {
          const isDo = block.type === 'do' || block.type === undefined;
          const silent = isDo && block.tempo == null;
          const items = block.content?.items ?? [];
          const isExpanded = expanded.has(block.id);
          return (
            <BlockCard key={block.id}>
              <BlockHeader>
                <BlockNumber>{i + 1}</BlockNumber>
                <LabelInput
                  value={block.label ?? ''}
                  onChange={e => updateBlock(block.id, { label: e.target.value })}
                  placeholder="Label"
                />
                <MoveBtn
                  onClick={() => setBlocks(prev => move(prev, i, -1))}
                  disabled={i === 0}
                  title="Move up"
                >
                  <ChevronUpIcon size={14} />
                </MoveBtn>
                <MoveBtn
                  onClick={() => setBlocks(prev => move(prev, i, 1))}
                  disabled={i === blocks.length - 1}
                  title="Move down"
                >
                  <ChevronDownIcon size={14} />
                </MoveBtn>
                <DeleteBtn
                  onClick={() => setBlocks(prev => prev.filter(b => b.id !== block.id))}
                  title="Remove"
                >
                  <XIcon size={14} />
                </DeleteBtn>
              </BlockHeader>

              <FieldGrid>
                <div>
                  <FieldLabel>Type</FieldLabel>
                  <Select
                    value={block.type ?? 'do'}
                    onChange={e =>
                      updateBlock(block.id, { type: e.target.value as SessionBlockType })
                    }
                  >
                    {TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <FieldLabel>Section</FieldLabel>
                  <Select
                    value={block.sectionId ?? NO_SECTION}
                    onChange={e =>
                      updateBlock(block.id, {
                        sectionId: e.target.value === NO_SECTION ? undefined : e.target.value,
                      })
                    }
                  >
                    <option value={NO_SECTION}>None (structural)</option>
                    {sections.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name || 'Untitled'}
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
                {isDo && (
                  <div>
                    <FieldLabel>Metronome</FieldLabel>
                    <SilentToggle>
                      <input
                        type="checkbox"
                        checked={silent}
                        onChange={e =>
                          updateBlock(
                            block.id,
                            e.target.checked
                              ? {
                                  tempo: undefined,
                                  timeSignature: undefined,
                                  subdivision: undefined,
                                }
                              : { tempo, timeSignature, subdivision }
                          )
                        }
                      />
                      Silent
                    </SilentToggle>
                  </div>
                )}
                {isDo && !silent && (
                  <>
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
                        value={block.subdivision ?? 'quarter'}
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
                  </>
                )}
              </FieldGrid>

              {block.type !== 'break' && (
                <ContentToggle onClick={() => toggleContent(block.id)}>
                  {isExpanded ? '− Card content' : `+ Card content (${items.length} items)`}
                </ContentToggle>
              )}

              {block.type !== 'break' && isExpanded && (
                <ContentPanel>
                  <div>
                    <FieldLabel>Eyebrow</FieldLabel>
                    <SectionNameInput
                      value={block.content?.eyebrow ?? ''}
                      onChange={e => updateContent(block.id, { eyebrow: e.target.value })}
                      placeholder="e.g. warm-up, technique"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <FieldLabel as="div">Items</FieldLabel>
                  {items.map((item, itemIdx) => (
                    <ItemRow key={itemIdx}>
                      <SectionNameInput
                        value={item.text}
                        onChange={e =>
                          updateContent(block.id, {
                            items: items.map((it, idx) =>
                              idx === itemIdx ? { ...it, text: e.target.value } : it
                            ),
                          })
                        }
                        placeholder="Item text"
                      />
                      <SectionNameInput
                        value={item.note ?? ''}
                        onChange={e =>
                          updateContent(block.id, {
                            items: items.map((it, idx) =>
                              idx === itemIdx ? { ...it, note: e.target.value || undefined } : it
                            ),
                          })
                        }
                        placeholder="Note"
                        style={{ flex: '0 0 35%' }}
                      />
                      <DeleteBtn
                        onClick={() =>
                          updateContent(block.id, {
                            items: items.filter((_, idx) => idx !== itemIdx),
                          })
                        }
                        title="Remove item"
                      >
                        <XIcon size={14} />
                      </DeleteBtn>
                    </ItemRow>
                  ))}
                  <AddSmallBtn
                    onClick={() => updateContent(block.id, { items: [...items, { text: '' }] })}
                  >
                    + Add item
                  </AddSmallBtn>
                  <div>
                    <FieldLabel>Prose</FieldLabel>
                    <Textarea
                      value={block.content?.prose ?? ''}
                      onChange={e =>
                        updateContent(block.id, { prose: e.target.value || undefined })
                      }
                      placeholder="Freeform paragraph under the items"
                    />
                  </div>
                </ContentPanel>
              )}
            </BlockCard>
          );
        })}
      </BlockList>

      <AddBtn onClick={addBlock}>+ Add block</AddBtn>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <Footer>
        {lesson && (
          <DeleteLessonBtn
            armed={deleteArmed}
            onClick={handleDelete}
            onBlur={() => setDeleteArmed(false)}
          >
            {deleteArmed ? 'Confirm delete' : 'Delete'}
          </DeleteLessonBtn>
        )}
        <CancelBtn onClick={onCancel}>Cancel</CancelBtn>
        <SaveBtn onClick={handleSave}>Save</SaveBtn>
      </Footer>
    </>
  );
};

export default LessonEditor;
