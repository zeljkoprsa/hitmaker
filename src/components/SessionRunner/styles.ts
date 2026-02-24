import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

// --- Runner bar (running / paused) ---

export const RunnerBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
  background: rgba(28, 28, 28, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0));
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RunnerInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RunnerName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RunnerMeta = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RunnerTimer = styled.span<{ overtime: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ overtime, theme }) =>
    overtime ? theme.colors.metronome.accent : 'rgba(255,255,255,0.5)'};
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
`;

export const NextButton = styled.button`
  background: ${({ theme }) => theme.colors.metronome.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  padding: 0 16px;
  height: 44px;
  flex-shrink: 0;
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    opacity: 0.7;
    transform: scale(0.97);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      opacity: 1;
    }

    &:active {
      opacity: 0.7;
    }
  }
`;

export const IconButton = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: rgba(255, 255, 255, 0.45);
  font-size: 15px;
  cursor: pointer;
  width: 36px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    color 150ms ease,
    border-color 150ms ease;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:active {
    color: rgba(255, 255, 255, 0.6);
  }
`;

export const EndButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  font-size: 18px;
  cursor: pointer;
  width: 36px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition: color 150ms ease;

  &:hover {
    color: rgba(255, 255, 255, 0.6);
  }
`;

// --- Pre-session preview overlay ---

export const PreviewOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndices.popover};
  background: rgba(18, 18, 18, 0.97);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 28px;
  padding-bottom: calc(32px + env(safe-area-inset-bottom, 0));
  text-align: center;
`;

export const PreviewTitle = styled.h2`
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  letter-spacing: -0.02em;
`;

export const PreviewMeta = styled.p`
  margin: 0 0 4px;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.35);
`;

export const PreviewBlock = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.55);
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

export const PreviewDivider = styled.div`
  width: 32px;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 24px 0;
`;

export const PreviewInstructions = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.2);
  max-width: 280px;
  line-height: 1.5;
`;

export const PreviewFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
`;

// --- Countdown ---

const popIn = keyframes`
  from {
    opacity: 0;
    transform: scale(1.4);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const CountdownNumber = styled.div`
  font-size: 96px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ theme }) => theme.colors.metronome.accent};
  line-height: 1;
  letter-spacing: -0.04em;
  animation: ${popIn} 0.25s ease-out both;
`;

export const CountdownLabel = styled.p`
  margin: 16px 0 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;
