import React, { useEffect } from 'react';

import PlaylistsSection from '../Sidebar/sections/PlaylistsSection';
import PracticeSection from '../Sidebar/sections/PracticeSection';
import {
  CloseButton,
  Overlay,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  SectionDivider,
} from '../Sidebar/styles';

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} aria-hidden="true" />
      <Panel isOpen={isOpen} side="left" role="dialog" aria-modal="true" aria-label="Menu">
        <PanelHeader>
          <PanelTitle>Menu</PanelTitle>
          <CloseButton onClick={onClose} aria-label="Close">
            &#x2715;
          </CloseButton>
        </PanelHeader>

        <PanelContent>
          <PracticeSection />
          <SectionDivider />
          <PlaylistsSection />
        </PanelContent>
      </Panel>
    </>
  );
};

export default LeftSidebar;
