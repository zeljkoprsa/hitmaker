import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';
import { PracticeSession } from '../../core/types/SessionTypes';
import PlaylistsSection from '../Sidebar/sections/PlaylistsSection';
import PreferencesSection from '../Sidebar/sections/PreferencesSection';
import ProfileSection from '../Sidebar/sections/ProfileSection';
import SignInView from '../Sidebar/SignInView';
import {
  CloseButton,
  Overlay,
  PanelContent,
  PanelHeader,
  PanelTitle,
  Rail,
  RailButton,
  SectionDivider,
  SidebarContainer,
  SidebarPanel,
  SignOutArea,
  SignOutButton,
} from '../Sidebar/styles';

import SessionEditor from './SessionEditor';
import SessionHistory from './SessionHistory';
import SessionList from './SessionList';
import TempoTrainerForm from './TempoTrainerForm';

export type SectionType = 'practice' | 'history' | 'account';
type PracticeView = 'list' | 'edit' | 'trainer';

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

const RailAccountBtn = styled.button<{ isActive?: boolean }>`
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  border: none;
  background: ${({ isActive }) => (isActive ? 'rgba(246, 65, 5, 0.15)' : 'transparent')};
  color: ${({ isActive, theme }) =>
    isActive ? theme.colors.metronome.accent : 'rgba(255,255,255,0.45)'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 150ms ease,
    color 150ms ease;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  &:active {
    background: rgba(255, 255, 255, 0.12);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background: ${({ isActive }) => (isActive ? 'rgba(246, 65, 5, 0.15)' : 'transparent')};
    }

    &:active {
      background: rgba(255, 255, 255, 0.12);
    }
  }
`;

const RailSpacer = styled.div`
  flex: 1;
`;

/* ── Component ────────────────────────────────────────────────────────── */

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeSection,
  onSetSection,
  onClose,
}) => {
  const [practiceView, setPracticeView] = useState<PracticeView>('list');
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
        if (activeSection === 'practice' && (practiceView === 'edit' || practiceView === 'trainer')) {
          setPracticeView('list');
          setEditingSession(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, practiceView, onClose]);

  // Lock body scroll on mobile only
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    document.body.style.overflow = activeSection && isMobile ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeSection]);

  // Reset practice sub-view when leaving practice section
  useEffect(() => {
    if (activeSection !== 'practice') {
      setPracticeView('list');
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
    if (activeSection === 'practice') {
      if (practiceView === 'edit') return editingSession ? 'Edit Session' : 'New Session';
      if (practiceView === 'trainer') return 'Tempo Trainer';
      return 'Practice';
    }
    if (activeSection === 'history') return 'Practice History';
    if (activeSection === 'account') return user ? 'Account' : 'Sign In';
    return '';
  };

  const showBack =
    activeSection === 'practice' && (practiceView === 'edit' || practiceView === 'trainer');

  const handleCloseOrBack = () => {
    if (showBack) {
      setPracticeView('list');
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

  return (
    <>
      <Overlay
        isOpen={activeSection !== null}
        onClick={onClose}
        aria-hidden="true"
        style={{ background: 'transparent', backdropFilter: 'none' }}
      />

      <SidebarContainer isOpen={activeSection !== null}>
        {/* Icon rail */}
        <Rail>
          <RailButton
            isActive={activeSection === 'practice'}
            onClick={() => handleRailClick('practice')}
            aria-label="Practice sessions"
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
            isActive={activeSection === 'history'}
            onClick={() => handleRailClick('history')}
            aria-label="Practice history"
          >
            {/* Clock */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 6.5V10l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </RailButton>

          <RailSpacer />

          <RailAccountBtn
            isActive={activeSection === 'account'}
            onClick={() => handleRailClick('account')}
            aria-label="Account"
          >
            {user ? (
              <>
                <AvatarCircle>{initial}</AvatarCircle>
                <SyncDot dotColor={getSyncColor()} doPulse={isSaving} />
              </>
            ) : (
              <GuestIcon>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  <path
                    d="M2 14c0-2.485 2.686-4.5 6-4.5s6 2.015 6 4.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </GuestIcon>
            )}
          </RailAccountBtn>
        </Rail>

        {/* Content panel */}
        <SidebarPanel
          isOpen={activeSection !== null}
          role="dialog"
          aria-modal="true"
          aria-label={getPanelTitle()}
        >
          <PanelHeader>
            <PanelTitle>{getPanelTitle()}</PanelTitle>
            <CloseButton onClick={handleCloseOrBack} aria-label={showBack ? 'Back' : 'Close'}>
              {showBack ? '←' : '✕'}
            </CloseButton>
          </PanelHeader>

          <PanelContent>
            {activeSection === 'practice' && (
              <>
                {practiceView === 'list' && (
                  <>
                    <SessionList
                      onEdit={s => {
                        setEditingSession(s);
                        setPracticeView('edit');
                      }}
                      onNew={() => {
                        setEditingSession(null);
                        setPracticeView('edit');
                      }}
                      onClose={onClose}
                      onTrainer={() => setPracticeView('trainer')}
                      onHistory={() => onSetSection('history')}
                    />
                    <SectionDivider />
                    <PlaylistsSection />
                  </>
                )}
                {practiceView === 'edit' && (
                  <SessionEditor
                    session={editingSession}
                    onSave={() => {
                      setPracticeView('list');
                      setEditingSession(null);
                    }}
                    onCancel={() => {
                      setPracticeView('list');
                      setEditingSession(null);
                    }}
                  />
                )}
                {practiceView === 'trainer' && (
                  <TempoTrainerForm onStart={onClose} onCancel={() => setPracticeView('list')} />
                )}
              </>
            )}

            {activeSection === 'history' && (
              <SessionHistory onBack={() => onSetSection('practice')} />
            )}

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
        </SidebarPanel>
      </SidebarContainer>
    </>
  );
};

export default LeftSidebar;
