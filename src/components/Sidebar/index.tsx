import React, { useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';

import PreferencesSection from './sections/PreferencesSection';
import ProfileSection from './sections/ProfileSection';
import SignInView from './SignInView';
import {
  CloseButton,
  Overlay,
  Panel,
  PanelContent,
  PanelHeader,
  PanelTitle,
  SectionDivider,
  SignOutArea,
  SignOutButton,
} from './styles';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();

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

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const title = user ? 'Account' : 'Sign In';

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} aria-hidden="true" />
      <Panel isOpen={isOpen} side="right" role="dialog" aria-modal="true" aria-label={title}>
        <PanelHeader>
          <PanelTitle>{title}</PanelTitle>
          <CloseButton onClick={onClose} aria-label="Close">
            &#x2715;
          </CloseButton>
        </PanelHeader>

        <PanelContent>
          {user ? (
            <>
              <ProfileSection />
              <SectionDivider />
              <PreferencesSection />
            </>
          ) : (
            <SignInView onClose={onClose} />
          )}
        </PanelContent>

        {user && (
          <SignOutArea>
            <SignOutButton onClick={handleSignOut}>Sign Out</SignOutButton>
          </SignOutArea>
        )}
      </Panel>
    </>
  );
};

export default Sidebar;
