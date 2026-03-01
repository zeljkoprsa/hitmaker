import React, { useEffect, useState } from 'react';

import { PracticeSession } from '../../core/types/SessionTypes';
import PlaylistsSection from '../Sidebar/sections/PlaylistsSection';
import {
  CloseButton,
  Overlay,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  SectionDivider,
} from '../Sidebar/styles';

import SessionEditor from './SessionEditor';
import SessionHistory from './SessionHistory';
import SessionList from './SessionList';
import TempoTrainerForm from './TempoTrainerForm';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'list' | 'edit' | 'trainer' | 'history';

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<View>('list');
  const [editingSession, setEditingSession] = useState<PracticeSession | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (view === 'edit' || view === 'trainer' || view === 'history') {
          setView('list');
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, view]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset to list when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setEditingSession(null);
    }
  }, [isOpen]);

  const handleEdit = (session: PracticeSession) => {
    setEditingSession(session);
    setView('edit');
  };

  const handleNew = () => {
    setEditingSession(null);
    setView('edit');
  };

  const handleTrainer = () => {
    setView('trainer');
  };

  const handleHistory = () => {
    setView('history');
  };

  const handleSaved = () => {
    setView('list');
    setEditingSession(null);
  };

  const handleBack = () => {
    setView('list');
    setEditingSession(null);
  };

  const getTitle = () => {
    if (view === 'edit') return editingSession ? 'Edit Session' : 'New Session';
    if (view === 'trainer') return 'Tempo Trainer';
    if (view === 'history') return 'Practice History';
    return 'Practice';
  };

  const handleClose = () => {
    if (view === 'edit' || view === 'trainer' || view === 'history') {
      handleBack();
    } else {
      onClose();
    }
  };

  const closeLabel = view === 'list' ? 'Close' : 'Back';
  const closeIcon = view === 'list' ? '✕' : '←';

  return (
    <>
      <Overlay
        isOpen={isOpen}
        onClick={view === 'list' ? onClose : handleBack}
        aria-hidden="true"
      />

      <Panel isOpen={isOpen} side="left" role="dialog" aria-modal="true" aria-label={getTitle()}>
        <PanelHeader>
          <PanelTitle>{getTitle()}</PanelTitle>
          <CloseButton onClick={handleClose} aria-label={closeLabel}>
            {closeIcon}
          </CloseButton>
        </PanelHeader>

        <PanelContent>
          {view === 'list' && (
            <>
              <SessionList
                onEdit={handleEdit}
                onNew={handleNew}
                onClose={onClose}
                onTrainer={handleTrainer}
                onHistory={handleHistory}
              />
              <SectionDivider />
              <PlaylistsSection />
            </>
          )}
          {view === 'edit' && (
            <SessionEditor session={editingSession} onSave={handleSaved} onCancel={handleBack} />
          )}
          {view === 'trainer' && (
            <TempoTrainerForm onStart={onClose} onCancel={handleBack} />
          )}
          {view === 'history' && <SessionHistory onBack={handleBack} />}
        </PanelContent>
      </Panel>
    </>
  );
};

export default LeftSidebar;
