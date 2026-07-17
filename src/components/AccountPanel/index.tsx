import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect } from 'react';

import { useAuth } from '../../context/AuthContext';
import { XIcon } from '../Sidebar/icons';
import PreferencesSection from '../Sidebar/sections/PreferencesSection';
import ProfileSection from '../Sidebar/sections/ProfileSection';
import SignInView from '../Sidebar/SignInView';

/**
 * Account & preferences as a slide-over overlay (JAK-50). Settings, not a
 * primary practice surface, so it stays an overlay rather than a center-stage
 * view — opened from the nav's Account button.
 */

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const slideIn = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndices.modal + 5};
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 180ms ease-out;
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(400px, 100vw);
  background: ${({ theme }) => theme.colors.metronome.background};
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 240ms cubic-bezier(0.16, 1, 0.3, 1);
  padding-top: env(safe-area-inset-top, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  flex-shrink: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.metronome.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 20px 24px;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 20px 0;
`;

const Footer = styled.div`
  flex-shrink: 0;
  padding: 12px 20px calc(12px + env(safe-area-inset-bottom, 0));
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const SignOutBtn = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.6);
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 11px;
  min-height: 44px;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

interface AccountPanelProps {
  open: boolean;
  onClose: () => void;
}

export const AccountPanel: React.FC<AccountPanelProps> = ({ open, onClose }) => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Overlay onClick={onClose}>
      <Panel
        role="dialog"
        aria-modal="true"
        aria-label="Account"
        onClick={e => e.stopPropagation()}
      >
        <Head>
          <Title>{user ? 'Account' : 'Sign In'}</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            <XIcon size={14} />
          </CloseBtn>
        </Head>
        <Content>
          {user ? (
            <>
              <ProfileSection />
              <Divider />
              <PreferencesSection />
            </>
          ) : (
            <SignInView onClose={onClose} />
          )}
        </Content>
        {user && (
          <Footer>
            <SignOutBtn onClick={handleSignOut}>Sign Out</SignOutBtn>
          </Footer>
        )}
      </Panel>
    </Overlay>
  );
};

export default AccountPanel;
