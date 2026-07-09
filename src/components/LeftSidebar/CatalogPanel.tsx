import styled from '@emotion/styled';
import React, { useState } from 'react';

import { useLessons } from '../../context/LessonContext';
import { useQueue } from '../../context/QueueContext';
import { useSession } from '../../context/SessionContext';
import { CATALOG_ITEMS, CatalogItem } from '../../features/Catalog/catalogItems';
import { DrumIcon, PlayIcon, PlusIcon } from '../Sidebar/icons';

type CatalogFilter = 'all' | 'lessons' | 'starters';

interface CatalogPanelProps {
  onClose: () => void;
}

const FilterRow = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
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

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StarterCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StarterTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StarterBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LessonTile = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(135deg, #e8ff47 0%, #b8cc38 100%);
  color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.35);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const CircleBtn = styled.button`
  width: 32px;
  height: 32px;
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
    border-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.metronome.accent};
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    color: white;
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.7);
    }

    &:active {
      background: ${({ theme }) => theme.colors.metronome.accent};
      border-color: ${({ theme }) => theme.colors.metronome.accent};
      color: white;
    }
  }
`;

const CopyBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 4px 6px;
  min-height: 28px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition:
    color 150ms ease,
    background-color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    background: rgba(255, 255, 255, 0.06);
  }
`;

const OpenLessonArea = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
`;

const FILTERS: { value: CatalogFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lessons', label: 'Lessons' },
  { value: 'starters', label: 'Starters' },
];

const matchesFilter = (item: CatalogItem, filter: CatalogFilter): boolean =>
  filter === 'all' ||
  (filter === 'lessons' && item.type === 'lesson') ||
  (filter === 'starters' && item.type === 'starter');

const CatalogPanel: React.FC<CatalogPanelProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const { openLesson } = useLessons();
  const { addToQueue } = useQueue();
  const { duplicateSession, startSession } = useSession();

  const items = CATALOG_ITEMS.filter(item => matchesFilter(item, filter));

  const handleAddToQueue = (item: CatalogItem) => {
    addToQueue({
      refType: item.type,
      refId: item.id,
      title: item.title,
      meta: item.meta,
    });
  };

  const handleStartStarter = (item: CatalogItem) => {
    if (!item.session) return;
    startSession(item.session);
    onClose();
  };

  return (
    <>
      <FilterRow role="tablist" aria-label="Catalog filter">
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
        {items.map(item =>
          item.type === 'lesson' ? (
            <Card key={item.id}>
              <OpenLessonArea
                onClick={() => item.lessonId && openLesson(item.lessonId)}
                aria-label={`Open lesson: ${item.title}`}
              >
                <LessonTile>
                  <DrumIcon size={16} />
                </LessonTile>
                <Info>
                  <Title>{item.title}</Title>
                  <Meta>{item.meta}</Meta>
                </Info>
              </OpenLessonArea>
              <Actions>
                <CircleBtn
                  onClick={() => handleAddToQueue(item)}
                  aria-label={`Add ${item.title} to queue`}
                >
                  <PlusIcon size={14} />
                </CircleBtn>
              </Actions>
            </Card>
          ) : (
            <StarterCard key={item.id}>
              <StarterTop>
                <Title style={{ flex: 1, minWidth: 0 }}>{item.title}</Title>
                <CircleBtn
                  onClick={() => handleAddToQueue(item)}
                  aria-label={`Add ${item.title} to queue`}
                >
                  <PlusIcon size={14} />
                </CircleBtn>
                <CircleBtn
                  onClick={() => handleStartStarter(item)}
                  aria-label={`Start ${item.title}`}
                >
                  <PlayIcon size={13} />
                </CircleBtn>
              </StarterTop>
              <StarterBottom>
                <Meta>{item.meta}</Meta>
                {item.session && (
                  <CopyBtn
                    onClick={() => duplicateSession(item.session!)}
                    aria-label={`Copy ${item.title} to My Sessions`}
                  >
                    Copy
                  </CopyBtn>
                )}
              </StarterBottom>
            </StarterCard>
          )
        )}
      </List>
    </>
  );
};

export default CatalogPanel;
