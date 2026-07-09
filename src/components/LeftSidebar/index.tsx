import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { PracticeSession } from '../../core/types/SessionTypes';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';
import { BookIcon, ChevronLeftIcon, QueueIcon, XIcon } from '../Sidebar/icons';
import PreferencesSection from '../Sidebar/sections/PreferencesSection';
import ProfileSection from '../Sidebar/sections/ProfileSection';
import SignInView from '../Sidebar/SignInView';
import {
  CloseButton,
  DesktopPanelTitle,
  Overlay,
  PanelContent,
  PanelHeader,
  PanelTab,
  PanelTabs,
  PanelTitle,
  Rail,
  RailButton,
  SectionDivider,
  SidebarContainer,
  SidebarPanel,
  SignOutArea,
  SignOutButton,
} from '../Sidebar/styles';

import CatalogPanel from './CatalogPanel';
import QueuePanel from './QueuePanel';
import SessionEditor from './SessionEditor';
import SessionHistory from './SessionHistory';
import SessionList from './SessionList';

export type SectionType = 'catalog' | 'sessions' | 'queue' | 'account';
type SessionsView = 'list' | 'edit' | 'history';

export interface LeftSidebarProps {
  activeSection: SectionType | null;
  onSetSection: (s: SectionType | null) => void;
  onClose: () => void;
}

/* ── Account rail button internals ───────────────────────────────────── */

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const SyncDot = styled.span<{ dotColor: string; doPulse?: boolean }>`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ dotColor }) => dotColor};
  animation: ${({ doPulse }) => (doPulse ? pulse : 'none')} 1.2s ease-in-out infinite;
`;

const AvatarCircle = styled.div`
  width: 28px;
  height: 28px;
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
  box-shadow: 0 2px 8px rgba(246, 65, 5, 0.2);
`;

const GuestIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
`;

const RailSpacer = styled.div`
  flex: 1;
`;

/** Mobile-only account entry pinned to the bottom of the drawer — mirrors
 *  the desktop rail, where the avatar anchors at the bottom. */
const MobileAccountBar = styled.button<{ isActive?: boolean }>`
  display: none;

  @media (max-width: 1023px) {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    flex-shrink: 0;
    background: ${({ isActive }) => (isActive ? 'rgba(246, 65, 5, 0.08)' : 'transparent')};
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    cursor: pointer;
    padding: 10px 20px;
    padding-bottom: calc(10px + env(safe-area-inset-bottom, 0));
    min-height: 56px;
    text-align: left;
    transition: background-color 150ms ease;

    &:active {
      background: rgba(255, 255, 255, 0.06);
    }
  }
`;

const MobileAccountGlyph = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const MobileAccountLabel = styled.span<{ isActive?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.55)'};
`;

const GuestGlyph: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M2 14c0-2.485 2.686-4.5 6-4.5s6 2.015 6 4.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Component ────────────────────────────────────────────────────────── */

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeSection,
  onSetSection,
  onClose,
}) => {
  const [sessionsView, setSessionsView] = useState<SessionsView>('list');
  const [editingSession, setEditingSession] = useState<PracticeSession | null>(null);
  const { user, signOut } = useAuth();
  const { isSaving } = useMetronome();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Escape key: sub-view → list, list → close
  useEffect(() => {
    if (!activeSection) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeSection === 'sessions' && sessionsView !== 'list') {
          setSessionsView('list');
          setEditingSession(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, sessionsView, onClose]);

  // Lock body scroll on mobile only
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    document.body.style.overflow = activeSection && isMobile ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeSection]);

  // Reset sub-view when leaving the sessions section
  useEffect(() => {
    if (activeSection !== 'sessions') {
      setSessionsView('list');
      setEditingSession(null);
    }
  }, [activeSection]);

  const handleRailClick = (section: SectionType) => {
    if (activeSection === section) {
      onSetSection(null);
    } else {
      onSetSection(section);
    }
  };

  const getPanelTitle = () => {
    if (activeSection === 'catalog') return 'Catalog';
    if (activeSection === 'sessions') {
      if (sessionsView === 'edit') return editingSession ? 'Edit Session' : 'New Session';
      if (sessionsView === 'history') return 'Practice History';
      return 'My Sessions';
    }
    if (activeSection === 'queue') return 'Queue';
    if (activeSection === 'account') return user ? 'Account' : 'Sign In';
    return '';
  };

  const showBack = activeSection === 'sessions' && sessionsView !== 'list';

  const handleCloseOrBack = () => {
    if (showBack) {
      setSessionsView('list');
      setEditingSession(null);
    } else {
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const getSyncColor = () => {
    if (!online) return '#faad14';
    if (isSaving) return '#f64105';
    return '#52c41a';
  };

  const initial = user?.email ? user.email[0].toUpperCase() : '';

  const accountGlyph = user ? (
    <>
      <AvatarCircle>{initial}</AvatarCircle>
      <SyncDot dotColor={getSyncColor()} doPulse={isSaving} />
    </>
  ) : (
    <GuestIcon>
      <GuestGlyph />
    </GuestIcon>
  );

  return (
    <>
      <Overlay isOpen={activeSection !== null} onClick={onClose} aria-hidden="true" />

      <SidebarContainer isOpen={activeSection !== null}>
        {/* Icon rail (desktop only) */}
        <Rail>
          <RailButton
            isActive={activeSection === 'catalog'}
            onClick={() => handleRailClick('catalog')}
            aria-label="Catalog"
            data-tip="Catalog"
          >
            <BookIcon size={20} />
          </RailButton>

          <RailButton
            isActive={activeSection === 'sessions'}
            onClick={() => handleRailClick('sessions')}
            aria-label="My sessions"
            data-tip="My Sessions"
          >
            {/* Music note */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M8 15V5.5l8-2V13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="15" r="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="14" cy="13" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </RailButton>

          <RailButton
            isActive={activeSection === 'queue'}
            onClick={() => handleRailClick('queue')}
            aria-label="Practice queue"
            data-tip="Queue"
          >
            <QueueIcon size={20} />
          </RailButton>

          <RailSpacer />

          <RailButton
            isActive={activeSection === 'account'}
            onClick={() => handleRailClick('account')}
            aria-label="Account"
            data-tip="Account"
          >
            {accountGlyph}
          </RailButton>
        </Rail>

        {/* Content panel */}
        <SidebarPanel
          isOpen={activeSection !== null}
          role="dialog"
          aria-modal="true"
          aria-label={getPanelTitle()}
        >
          <PanelHeader>
            {showBack ? (
              <PanelTitle>{getPanelTitle()}</PanelTitle>
            ) : (
              <>
                <DesktopPanelTitle>{getPanelTitle()}</DesktopPanelTitle>
                <PanelTabs>
                  <PanelTab
                    isActive={activeSection === 'catalog'}
                    onClick={() => onSetSection('catalog')}
                  >
                    Catalog
                  </PanelTab>
                  <PanelTab
                    isActive={activeSection === 'sessions'}
                    onClick={() => onSetSection('sessions')}
                  >
                    Sessions
                  </PanelTab>
                  <PanelTab
                    isActive={activeSection === 'queue'}
                    onClick={() => onSetSection('queue')}
                  >
                    Queue
                  </PanelTab>
                </PanelTabs>
              </>
            )}
            <CloseButton onClick={handleCloseOrBack} aria-label={showBack ? 'Back' : 'Close'}>
              {showBack ? <ChevronLeftIcon /> : <XIcon />}
            </CloseButton>
          </PanelHeader>

          <PanelContent>
            {activeSection === 'catalog' && <CatalogPanel onClose={onClose} />}

            {activeSection === 'sessions' && (
              <>
                {sessionsView === 'list' && (
                  <SessionList
                    onEdit={s => {
                      setEditingSession(s);
                      setSessionsView('edit');
                    }}
                    onNew={() => {
                      setEditingSession(null);
                      setSessionsView('edit');
                    }}
                    onClose={onClose}
                    onHistory={() => setSessionsView('history')}
                  />
                )}
                {sessionsView === 'edit' && (
                  <SessionEditor
                    session={editingSession}
                    onSave={() => {
                      setSessionsView('list');
                      setEditingSession(null);
                    }}
                    onCancel={() => {
                      setSessionsView('list');
                      setEditingSession(null);
                    }}
                  />
                )}
                {sessionsView === 'history' && (
                  <SessionHistory onBack={() => setSessionsView('list')} />
                )}
              </>
            )}

            {activeSection === 'queue' && <QueuePanel onClose={onClose} />}

            {activeSection === 'account' && (
              <>
                {user ? (
                  <>
                    <ProfileSection />
                    <SectionDivider />
                    <PreferencesSection />
                  </>
                ) : (
                  <SignInView onClose={() => onSetSection(null)} />
                )}
              </>
            )}
          </PanelContent>

          {activeSection === 'account' && user && (
            <SignOutArea>
              <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
            </SignOutArea>
          )}

          <MobileAccountBar
            isActive={activeSection === 'account'}
            onClick={() => onSetSection('account')}
            aria-label="Account"
          >
            <MobileAccountGlyph>{accountGlyph}</MobileAccountGlyph>
            <MobileAccountLabel isActive={activeSection === 'account'}>
              {user ? 'Account' : 'Sign In'}
            </MobileAccountLabel>
          </MobileAccountBar>
        </SidebarPanel>
      </SidebarContainer>
    </>
  );
};

export default LeftSidebar;
