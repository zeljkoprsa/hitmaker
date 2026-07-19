import styled from '@emotion/styled';
import React, { useState } from 'react';

import { useLessons } from '../../context/LessonContext';
import { useLessonsStore } from '../../context/LessonsContext';
import { useSession } from '../../context/SessionContext';
import { Lesson } from '../../core/types/LessonTypes';
import { CatalogItem } from '../../features/Catalog/catalogItems';
import { useCatalog } from '../../features/Catalog/useCatalog';
import { DrumIcon, PencilIcon, PlayIcon, PlusIcon } from '../Sidebar/icons';

type CatalogFilter = 'all' | 'lessons' | 'workouts';

interface CatalogPanelProps {
  onClose: () => void;
  /** Lesson authoring entry points (spec #7); omitted where editing
   *  shouldn't be offered. */
  onEditLesson?: (lesson: Lesson) => void;
  onNewLesson?: () => void;
  /** Markdown import entry point (spec #8). */
  onImportLesson?: () => void;
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

const WorkoutCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const WorkoutTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WorkoutBottom = styled.div`
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

const NewLessonRow = styled.div`
  display: flex;
  gap: 8px;

  > button {
    flex: 1;
  }
`;

const NewLessonBtn = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.35);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 10px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition:
    color 150ms ease,
    border-color 150ms ease;

  &:hover {
    color: rgba(255, 255, 255, 0.6);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const FILTERS: { value: CatalogFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'lessons', label: 'Lessons' },
  { value: 'workouts', label: 'Workouts' },
];

const matchesFilter = (item: CatalogItem, filter: CatalogFilter): boolean =>
  filter === 'all' ||
  (filter === 'lessons' && item.type === 'lesson') ||
  (filter === 'workouts' && item.type === 'workout');

const CatalogPanel: React.FC<CatalogPanelProps> = ({
  onClose,
  onEditLesson,
  onNewLesson,
  onImportLesson,
}) => {
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const { openLesson } = useLessons();
  const { getLesson } = useLessonsStore();
  const { duplicateSession, startSession } = useSession();

  const items = useCatalog().filter(item => matchesFilter(item, filter));

  const handleEditLesson = (item: CatalogItem) => {
    const lesson = item.lessonId ? getLesson(item.lessonId) : undefined;
    if (lesson && onEditLesson) onEditLesson(lesson);
  };

  // Workouts and lessons start the same way: both are block sessions run by
  // SessionContext; a lesson's guided flag swaps center stage to CoachStage
  const handleStartSession = (item: CatalogItem) => {
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
                {onEditLesson && (
                  <CircleBtn
                    onClick={() => handleEditLesson(item)}
                    aria-label={`Edit ${item.title}`}
                  >
                    <PencilIcon size={13} />
                  </CircleBtn>
                )}
                {item.session && (
                  <CircleBtn
                    onClick={() => handleStartSession(item)}
                    aria-label={`Start ${item.title}`}
                  >
                    <PlayIcon size={13} />
                  </CircleBtn>
                )}
              </Actions>
            </Card>
          ) : (
            <WorkoutCard key={item.id}>
              <WorkoutTop>
                <Title style={{ flex: 1, minWidth: 0 }}>{item.title}</Title>
                <CircleBtn
                  onClick={() => handleStartSession(item)}
                  aria-label={`Start ${item.title}`}
                >
                  <PlayIcon size={13} />
                </CircleBtn>
              </WorkoutTop>
              <WorkoutBottom>
                <Meta>{item.meta}</Meta>
                {item.session && (
                  <CopyBtn
                    onClick={() => duplicateSession(item.session!)}
                    aria-label={`Copy ${item.title} to My Sessions`}
                  >
                    Copy
                  </CopyBtn>
                )}
              </WorkoutBottom>
            </WorkoutCard>
          )
        )}
        {onNewLesson && filter !== 'workouts' && (
          <NewLessonRow>
            <NewLessonBtn onClick={onNewLesson}>
              <PlusIcon size={13} />
              New Lesson
            </NewLessonBtn>
            {onImportLesson && <NewLessonBtn onClick={onImportLesson}>Import .md</NewLessonBtn>}
          </NewLessonRow>
        )}
      </List>
    </>
  );
};

export default CatalogPanel;
