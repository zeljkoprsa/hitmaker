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

  @media (min-width: 1024px) {
    display: none;
  }
`;

/* ── Icon-rail sidebar components ─────────────────────────────────────── */

/** Wraps Rail + SidebarPanel. On mobile it slides in as a unit; on desktop
 *  it uses display:contents so Rail and SidebarPanel position themselves
 *  independently via position:fixed. */
export const SidebarContainer = styled.div<{ isOpen: boolean }>`
  @media (max-width: 1023px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    width: 320px;
    display: flex;
    z-index: ${({ theme }) => theme.zIndices.modal};
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    box-shadow: ${({ isOpen }) => (isOpen ? '8px 0 32px rgba(0, 0, 0, 0.5)' : 'none')};
  }

  @media (max-width: 374px) {
    width: 100vw;
  }

  @media (min-width: 1024px) {
    display: contents;
  }
`;

/** 56px icon strip. Fixed and always visible on desktop; hidden on mobile,
 *  where PanelTabs takes over section switching inside the drawer. */
export const Rail = styled.nav`
  background: ${({ theme }) => theme.colors.metronome.darkBackground};
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  @media (max-width: 1023px) {
    display: none;
  }

  @media (min-width: 1024px) {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 56px;
    z-index: ${({ theme }) => theme.zIndices.modal + 1};
    padding: calc(8px + env(safe-area-inset-top, 0)) 6px calc(8px + env(safe-area-inset-bottom, 0));
  }
`;

/** Individual rail icon button. Pass \`data-tip\` for a hover tooltip. */
export const RailButton = styled.button<{ isActive?: boolean }>`
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  border: none;
  background: ${({ isActive }) => (isActive ? 'rgba(246, 65, 5, 0.15)' : 'transparent')};
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.metronome.accent : 'rgba(255,255,255,0.65)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 150ms ease,
    color 150ms ease;
  flex-shrink: 0;

  /* Active-section indicator: accent bar on the rail's left edge */
  &::before {
    content: '';
    position: absolute;
    left: -6px;
    top: 50%;
    transform: translateY(-50%) scaleY(${({ isActive }) => (isActive ? 1 : 0)});
    width: 3px;
    height: 22px;
    border-radius: 0 2px 2px 0;
    background: ${({ theme }) => theme.colors.metronome.accent};
    transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: ${({ theme }) => theme.colors.metronome.primary};
  }

  &:active {
    background: rgba(255, 255, 255, 0.12);
  }

  /* Hover tooltip (hover-capable devices only) */
  @media (hover: hover) {
    &::after {
      content: attr(data-tip);
      position: absolute;
      left: calc(100% + 10px);
      top: 50%;
      transform: translateY(-50%);
      background: #333;
      color: rgba(255, 255, 255, 0.9);
      font-size: ${({ theme }) => theme.typography.fontSizes.xs};
      font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
      white-space: nowrap;
      padding: 5px 9px;
      border-radius: ${({ theme }) => theme.borders.radius.sm};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      opacity: 0;
      pointer-events: none;
      transition: opacity 120ms ease;
    }

    &:hover::after {
      opacity: 1;
      transition-delay: 400ms;
    }

    &[data-tip='']::after,
    &:not([data-tip])::after {
      display: none;
    }
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background: ${({ isActive }) => (isActive ? 'rgba(246, 65, 5, 0.15)' : 'transparent')};
      color: ${({ isActive, theme }) =>
        isActive ? theme.colors.metronome.accent : 'rgba(255,255,255,0.65)'};
    }

    &:active {
      background: rgba(255, 255, 255, 0.12);
    }
  }
`;

/** The content panel that slides beside the rail. Fixed on desktop; flex-item
 *  on mobile. One elevation step lighter than the rail/body so it reads as a
 *  layer above the app surface. */
export const SidebarPanel = styled.aside<{ isOpen: boolean }>`
  background: ${({ theme }) => theme.colors.metronome.background};
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;

  @media (max-width: 1023px) {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  @media (min-width: 1024px) {
    position: fixed;
    left: 56px;
    top: 0;
    bottom: 0;
    width: 300px;
    z-index: ${({ theme }) => theme.zIndices.modal};
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
    transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
    overflow: hidden;
    box-shadow: ${({ isOpen }) => (isOpen ? '8px 0 24px rgba(0, 0, 0, 0.45)' : 'none')};
  }
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

/** Panel title shown only on desktop, where the rail conveys the active
 *  section; on mobile PanelTabs replaces it in the header. */
export const DesktopPanelTitle = styled(PanelTitle)`
  @media (max-width: 1023px) {
    display: none;
  }
`;

/** Mobile-only segmented tabs for switching sections inside the drawer. */
export const PanelTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const PanelTab = styled.button<{ isActive?: boolean }>`
  position: relative;
  background: none;
  border: none;
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.metronome.primary : 'rgba(255, 255, 255, 0.45)'};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 10px 8px;
  min-height: 44px;
  transition: color 150ms ease;

  &::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 4px;
    height: 2px;
    border-radius: 1px;
    background: ${({ theme }) => theme.colors.metronome.accent};
    transform: scaleX(${({ isActive }) => (isActive ? 1 : 0)});
    transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
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
