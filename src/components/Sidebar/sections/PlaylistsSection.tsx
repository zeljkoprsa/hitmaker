import styled from '@emotion/styled';
import React from 'react';

import { useLessons } from '../../../context/LessonContext';
import { DrumIcon } from '../icons';
import { SectionHeader } from '../styles';

const LessonCard = styled.button`
  width: 100%;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.12);
  }

  &:active {
    background: rgba(255, 255, 255, 0.06);
    transform: scale(0.99);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.08);
    }

    &:active {
      background: rgba(255, 255, 255, 0.06);
    }
  }
`;

const LessonIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: linear-gradient(135deg, #e8ff47 0%, #b8cc38 100%);
  color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const LessonInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LessonTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.metronome.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LessonMeta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
`;

const ChevronIcon = styled.div`
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
`;

const PlaylistsSection: React.FC = () => {
  const { openLesson } = useLessons();

  return (
    <>
      <SectionHeader>Lessons</SectionHeader>
      <LessonCard
        onClick={() => openLesson('groove-is-in-the-heart')}
        aria-label="Open Groove Is In The Heart lesson"
      >
        <LessonIcon>
          <DrumIcon size={18} />
        </LessonIcon>
        <LessonInfo>
          <LessonTitle>Groove Is In The Heart</LessonTitle>
          <LessonMeta>Lesson 01 · Warm-up & Technique</LessonMeta>
        </LessonInfo>
        <ChevronIcon>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ChevronIcon>
      </LessonCard>
    </>
  );
};

export default PlaylistsSection;
