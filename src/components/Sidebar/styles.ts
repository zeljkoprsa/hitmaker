import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

interface PanelProps {
  isOpen: boolean;
  side?: 'left' | 'right';
}

export const Overlay = styled.div<PanelProps>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: ${({ theme }) => theme.zIndices.overlay};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: opacity 300ms ease;
  animation: ${fadeIn} 200ms ease-out;
`;

export const Panel = styled.aside<PanelProps>`
  position: fixed;
  top: 0;
  ${({ side = 'right' }) => (side === 'left' ? 'left: 0;' : 'right: 0;')}
  width: 280px;
  height: 100dvh;
  background: ${({ theme }) => theme.colors.metronome.darkBackground};
  ${({ side = 'right' }) =>
    side === 'left'
      ? 'border-right: 1px solid rgba(255, 255, 255, 0.06);'
      : 'border-left: 1px solid rgba(255, 255, 255, 0.06);'}
  z-index: ${({ theme }) => theme.zIndices.modal};
  transform: ${({ isOpen, side = 'right' }) => {
    if (isOpen) return 'translateX(0)';
    return side === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
  }};
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  ${({ side = 'right' }) =>
    side === 'left'
      ? 'padding-left: env(safe-area-inset-left, 0);'
      : 'padding-right: env(safe-area-inset-right, 0);'}

  @media (min-width: 428px) {
    width: 320px;
  }

  @media (max-width: 374px) {
    width: 100vw;
  }
`;

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
  padding-top: calc(16px + env(safe-area-inset-top, 0));
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  letter-spacing: -0.01em;
`;

export const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: 20px;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition: background-color 150ms ease;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.15);
    transform: scale(0.95);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
  }
`;

export const PanelContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0));

  /* Thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;

export const SectionDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 20px 0;
`;

export const SectionHeader = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
`;

export const SignOutArea = styled.div`
  flex-shrink: 0;
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0));
`;

export const SignOutButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.5);
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 12px;
  min-height: 44px;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background-color: rgba(255, 77, 79, 0.08);
    color: var(--color-error, #ff4d4f);
    border-color: rgba(255, 77, 79, 0.2);
  }

  &:active {
    background-color: rgba(255, 77, 79, 0.12);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.5);
      border-color: rgba(255, 255, 255, 0.08);
    }

    &:active {
      background-color: rgba(255, 77, 79, 0.08);
      color: var(--color-error, #ff4d4f);
    }
  }
`;
