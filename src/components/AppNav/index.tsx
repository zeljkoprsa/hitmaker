import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';
import { BookIcon, CalendarIcon, MetronomeIcon, NoteIcon } from '../Sidebar/icons';

export type ViewType = 'metronome' | 'catalog' | 'sessions' | 'journal';

interface NavItem {
  view: ViewType;
  label: string;
  icon: React.FC<{ size?: number }>;
}

const ITEMS: NavItem[] = [
  { view: 'metronome', label: 'Metronome', icon: MetronomeIcon },
  { view: 'catalog', label: 'Catalog', icon: BookIcon },
  { view: 'sessions', label: 'Sessions', icon: NoteIcon },
  { view: 'journal', label: 'Journal', icon: CalendarIcon },
];

interface AppNavProps {
  activeView: ViewType;
  onSetView: (v: ViewType) => void;
  onOpenAccount: () => void;
  accountActive: boolean;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

/* ── Desktop rail ─────────────────────────────────────────────────────── */

const Rail = styled.nav`
  background: ${({ theme }) => theme.colors.metronome.darkBackground};
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: none;

  @media (min-width: 1024px) {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 56px;
    z-index: ${({ theme }) => theme.zIndices.modal + 1};
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: calc(8px + env(safe-area-inset-top, 0)) 6px calc(8px + env(safe-area-inset-bottom, 0));
  }
`;

const RailButton = styled.button<{ isActive?: boolean }>`
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
      z-index: 2;
    }

    &:hover::after {
      opacity: 1;
      transition-delay: 400ms;
    }
  }
`;

const RailSpacer = styled.div`
  flex: 1;
`;

/* ── Mobile bottom tab bar ────────────────────────────────────────────── */

const BottomBar = styled.nav`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky + 1};
  background: rgba(20, 20, 20, 0.98);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  padding-bottom: env(safe-area-inset-bottom, 0);

  @media (min-width: 1024px) {
    display: none;
  }
`;

const Tab = styled.button<{ isActive?: boolean }>`
  flex: 1;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 2px;
  min-height: 52px;
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.metronome.accent : 'rgba(255,255,255,0.55)'};
  transition: color 150ms ease;

  &:active {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const TabLabel = styled.span`
  font-size: 10px;
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  letter-spacing: 0.02em;
`;

/* ── Account glyph (shared) ───────────────────────────────────────────── */

const AvatarCircle = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.metronome.accent} 0%,
    #d63a04 100%
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;

const GuestIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
`;

const SyncDot = styled.span<{ dotColor: string; doPulse?: boolean }>`
  position: absolute;
  top: 3px;
  right: 3px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ dotColor }) => dotColor};
  animation: ${({ doPulse }) => (doPulse ? pulse : 'none')} 1.2s ease-in-out infinite;
`;

const AccountGlyphWrap = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GuestGlyph: React.FC = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M2 14c0-2.485 2.686-4.5 6-4.5s6 2.015 6 4.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

export const AppNav: React.FC<AppNavProps> = ({
  activeView,
  onSetView,
  onOpenAccount,
  accountActive,
}) => {
  const { user } = useAuth();
  const { isSaving } = useMetronome();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const syncColor = !online ? '#faad14' : isSaving ? '#f64105' : '#52c41a';
  const initial = user?.email ? user.email[0].toUpperCase() : '';

  const accountGlyph = (
    <AccountGlyphWrap>
      {user ? (
        <AvatarCircle>{initial}</AvatarCircle>
      ) : (
        <GuestIcon>
          <GuestGlyph />
        </GuestIcon>
      )}
      <SyncDot dotColor={syncColor} doPulse={isSaving} />
    </AccountGlyphWrap>
  );

  return (
    <>
      <Rail aria-label="Primary">
        {ITEMS.map(({ view, label, icon: Icon }) => (
          <RailButton
            key={view}
            isActive={activeView === view && !accountActive}
            onClick={() => onSetView(view)}
            aria-label={label}
            data-tip={label}
          >
            <Icon size={20} />
          </RailButton>
        ))}
        <RailSpacer />
        <RailButton
          isActive={accountActive}
          onClick={onOpenAccount}
          aria-label="Account"
          data-tip="Account"
        >
          {accountGlyph}
        </RailButton>
      </Rail>

      <BottomBar aria-label="Primary">
        {ITEMS.map(({ view, label, icon: Icon }) => (
          <Tab
            key={view}
            isActive={activeView === view && !accountActive}
            onClick={() => onSetView(view)}
            aria-label={label}
          >
            <Icon size={20} />
            <TabLabel>{label}</TabLabel>
          </Tab>
        ))}
        <Tab isActive={accountActive} onClick={onOpenAccount} aria-label="Account">
          {accountGlyph}
          <TabLabel>{user ? 'Account' : 'Sign in'}</TabLabel>
        </Tab>
      </BottomBar>
    </>
  );
};

export default AppNav;
