import styled from '@emotion/styled';
import React from 'react';

import { ChevronLeftIcon } from './Sidebar/icons';

/**
 * Titled, scrollable center-stage container for the swappable views
 * (Catalog, Sessions, Journal) — the generalization of the CoachStage swap
 * (JAK-50). The metronome renders its own full-bleed view and doesn't use
 * this frame.
 */

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px 10px;
  flex-shrink: 0;
  /* Align the title with the centered content column below */
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const BackBtn = styled.button`
  width: 32px;
  height: 32px;
  margin-left: -6px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    background: rgba(255, 255, 255, 0.06);
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  letter-spacing: -0.01em;
`;

const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 20px 32px;
  /* Comfortable reading width on desktop; edge-to-edge on mobile */
  width: 100%;
  max-width: 620px;
  margin: 0 auto;
  box-sizing: border-box;

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 3px;
  }
`;

interface StageViewProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
}

export const StageView: React.FC<StageViewProps> = ({ title, onBack, children }) => (
  <Wrap>
    <HeaderRow>
      {onBack && (
        <BackBtn onClick={onBack} aria-label="Back">
          <ChevronLeftIcon size={18} />
        </BackBtn>
      )}
      <Title>{title}</Title>
    </HeaderRow>
    <Body>{children}</Body>
  </Wrap>
);

export default StageView;
