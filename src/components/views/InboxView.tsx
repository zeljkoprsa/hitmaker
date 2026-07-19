import styled from '@emotion/styled';
import React, { useState } from 'react';

import { useIntake } from '../../context/IntakeContext';
import { useLessons } from '../../context/LessonContext';
import { LessonDraft, useLessonsStore } from '../../context/LessonsContext';
import { IntakeItem, IntakeStatus } from '../../core/types/IntakeTypes';
import { detectSource, isCapturableUrl, visibleItems } from '../../core/utils/intakeStore';
import LessonEditor from '../LeftSidebar/LessonEditor';
import { PencilIcon, XIcon } from '../Sidebar/icons';
import StageView from '../StageView';

/**
 * Intake inbox (spec #9): capture URLs when found, distill them into draft
 * lessons when there's time. A staging area, not a library — items are
 * distilled (linked to the lesson they became) or discarded.
 */

const CaptureCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 9px 11px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  outline: none;
  min-height: 38px;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

const CaptureFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SourceTag = styled.span`
  font-size: 10px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
  flex: 1;
`;

const AddBtn = styled.button`
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
  padding: 9px 20px;
  min-height: 40px;
  transition: opacity 150ms ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
`;

const FilterChip = styled.button<{ isActive?: boolean }>`
  background: ${({ isActive }) => (isActive ? 'rgba(246, 65, 5, 0.15)' : 'rgba(255,255,255,0.04)')};
  border: none;
  border-radius: 999px;
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.5)'};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 6px 12px;
  min-height: 30px;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    color: ${({ isActive, theme }) =>
      isActive ? theme.colors.metronome.accent : theme.colors.metronome.primary};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Thumb = styled.img`
  width: 64px;
  height: 36px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.4);
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.a`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

const ItemMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: rgba(255, 255, 255, 0.3);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemNote = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const DistillBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.metronome.accent};
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.metronome.accent};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  padding: 5px 12px;
  min-height: 30px;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.metronome.accent};
    color: white;
  }
`;

const GhostBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 5px 8px;
  min-height: 30px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  display: flex;
  align-items: center;
  gap: 4px;
  transition:
    color 150ms ease,
    background-color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    background: rgba(255, 255, 255, 0.06);
  }
`;

const DangerBtn = styled(GhostBtn)<{ armed?: boolean }>`
  color: ${({ armed }) => (armed ? 'var(--color-error, #ff4d4f)' : 'rgba(255, 255, 255, 0.3)')};

  &:hover {
    color: var(--color-error, #ff4d4f);
    background: rgba(255, 77, 79, 0.08);
  }
`;

const EmptyState = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.6;
  text-align: center;
  padding: 32px 16px;
  margin: 0;
`;

const FILTERS: { value: IntakeStatus; label: string }[] = [
  { value: 'inbox', label: 'Inbox' },
  { value: 'distilled', label: 'Distilled' },
  { value: 'discarded', label: 'Discarded' },
];

const EMPTY_COPY: Record<IntakeStatus, string> = {
  inbox:
    'Nothing captured yet. Paste a YouTube or article URL above when you find something worth stealing.',
  distilled: 'Nothing distilled yet. Distilled items stay here, linked to the lesson they became.',
  discarded: 'Nothing discarded. Discarded items land here and can be restored.',
};

/** Distill: a draft lesson pre-seeded with the source link + note as a
 *  first teach block. The editor and save path are #7/#8 machinery. */
const distillDraft = (item: IntakeItem): LessonDraft => ({
  name: item.title ?? '',
  sections: [],
  blocks: [
    {
      id: crypto.randomUUID(),
      label: 'Source',
      type: 'teach',
      durationMinutes: 1,
      content: {
        eyebrow: 'source',
        items: [{ text: item.title ?? item.url, note: item.url }],
        ...(item.note ? { prose: item.note } : {}),
      },
    },
  ],
});

const itemDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const InboxItemCard: React.FC<{
  item: IntakeItem;
  onDistill: (item: IntakeItem) => void;
}> = ({ item, onDistill }) => {
  const { updateItem, setStatus, deleteItem } = useIntake();
  const { getLesson } = useLessonsStore();
  const { openLesson } = useLessons();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title ?? '');
  const [note, setNote] = useState(item.note ?? '');
  const [deleteArmed, setDeleteArmed] = useState(false);

  const lesson = item.lessonId ? getLesson(item.lessonId) : undefined;

  const saveEdit = () => {
    updateItem(item.id, { title, note });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    deleteItem(item.id);
  };

  return (
    <ItemCard>
      <ItemTop>
        {item.thumbnailUrl && <Thumb src={item.thumbnailUrl} alt="" />}
        <ItemInfo>
          <ItemTitle href={item.url} target="_blank" rel="noreferrer noopener">
            {item.title || item.url}
          </ItemTitle>
          <ItemMeta>
            {item.source} · {itemDate(item.createdAt)}
            {item.status === 'distilled' && lesson && ` · → ${lesson.name}`}
          </ItemMeta>
        </ItemInfo>
        <Actions>
          {item.status === 'inbox' && (
            <>
              <DistillBtn onClick={() => onDistill(item)}>Distill</DistillBtn>
              <GhostBtn onClick={() => setEditing(e => !e)} aria-label="Edit item">
                <PencilIcon size={13} />
              </GhostBtn>
              <GhostBtn onClick={() => setStatus(item.id, 'discarded')} aria-label="Discard item">
                <XIcon size={13} />
              </GhostBtn>
            </>
          )}
          {item.status === 'distilled' && (
            <>
              {lesson && <GhostBtn onClick={() => openLesson(lesson.id)}>Open lesson</GhostBtn>}
              <GhostBtn onClick={() => setStatus(item.id, 'discarded')} aria-label="Discard item">
                <XIcon size={13} />
              </GhostBtn>
            </>
          )}
          {item.status === 'discarded' && (
            <>
              <GhostBtn onClick={() => setStatus(item.id, 'inbox')}>Restore</GhostBtn>
              <DangerBtn armed={deleteArmed} onClick={handleDelete}>
                {deleteArmed ? 'Confirm delete' : 'Delete'}
              </DangerBtn>
            </>
          )}
        </Actions>
      </ItemTop>

      {!editing && item.note && <ItemNote>{item.note}</ItemNote>}

      {editing && (
        <>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            aria-label="Item title"
          />
          <Input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Note"
            aria-label="Item note"
            onKeyDown={e => e.key === 'Enter' && saveEdit()}
          />
          <CaptureFooter>
            <SourceTag />
            <AddBtn onClick={saveEdit}>Done</AddBtn>
          </CaptureFooter>
        </>
      )}
    </ItemCard>
  );
};

export const InboxView: React.FC = () => {
  const { items, addItem, setStatus } = useIntake();
  const [filter, setFilter] = useState<IntakeStatus>('inbox');
  const [distilling, setDistilling] = useState<IntakeItem | null>(null);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const urlValid = isCapturableUrl(url.trim());
  const isYouTube = urlValid && detectSource(url.trim()) === 'youtube';

  const handleAdd = () => {
    if (!urlValid) return;
    addItem({ url: url.trim(), title, note });
    setUrl('');
    setTitle('');
    setNote('');
  };

  if (distilling) {
    return (
      <StageView title="Distill" onBack={() => setDistilling(null)}>
        <LessonEditor
          lesson={null}
          draft={distillDraft(distilling)}
          onSaved={lessonId => setStatus(distilling.id, 'distilled', lessonId)}
          onSave={() => setDistilling(null)}
          onCancel={() => setDistilling(null)}
        />
      </StageView>
    );
  }

  const visible = visibleItems(items, filter);

  return (
    <StageView title="Inbox">
      <CaptureCard>
        <Input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste a URL — YouTube, article, anything worth keeping"
          aria-label="URL to capture"
          inputMode="url"
        />
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={isYouTube ? 'Title (fetched automatically — override if you like)' : 'Title'}
          aria-label="Title"
        />
        <Input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Note — why is this worth keeping?"
          aria-label="Note"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <CaptureFooter>
          <SourceTag>{urlValid ? (isYouTube ? 'youtube · auto title' : 'webpage') : ' '}</SourceTag>
          <AddBtn onClick={handleAdd} disabled={!urlValid}>
            Add
          </AddBtn>
        </CaptureFooter>
      </CaptureCard>

      <FilterRow role="tablist" aria-label="Inbox filter">
        {FILTERS.map(f => (
          <FilterChip
            key={f.value}
            isActive={filter === f.value}
            onClick={() => setFilter(f.value)}
            role="tab"
            aria-selected={filter === f.value}
          >
            {f.label}
          </FilterChip>
        ))}
      </FilterRow>

      <List>
        {visible.map(item => (
          <InboxItemCard key={item.id} item={item} onDistill={setDistilling} />
        ))}
        {visible.length === 0 && <EmptyState>{EMPTY_COPY[filter]}</EmptyState>}
      </List>
    </StageView>
  );
};

export default InboxView;
