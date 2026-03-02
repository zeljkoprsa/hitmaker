import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';

interface AccountFooterProps {
  onClick: () => void;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const FooterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  min-height: 56px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms ease;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.05);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background: transparent;
    }

    &:active {
      background: rgba(255, 255, 255, 0.05);
    }
  }
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
  flex-shrink: 0;
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
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.4);
`;

const FooterText = styled.div`
  flex: 1;
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.metronome.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const GuestText = styled.div`
  flex: 1;
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.5);
`;

const SyncDot = styled.span<{ color: string; pulse?: boolean }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
  animation: ${({ pulse: doPulse }) => (doPulse ? pulse : 'none')} 1.2s ease-in-out infinite;
`;

const AccountFooter: React.FC<AccountFooterProps> = ({ onClick }) => {
  const { user } = useAuth();
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

  const getSyncColor = () => {
    if (!online) return '#faad14';
    if (isSaving) return '#f64105';
    return '#52c41a';
  };

  const initial = user?.email ? user.email[0].toUpperCase() : '';

  return (
    <FooterContainer onClick={onClick} role="button" aria-label="Account settings">
      {user ? (
        <>
          <AvatarCircle>{initial}</AvatarCircle>
          <FooterText>{user.email}</FooterText>
          <SyncDot color={getSyncColor()} pulse={isSaving} />
        </>
      ) : (
        <>
          <GuestIcon>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M1.5 12.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </GuestIcon>
          <GuestText>Sign In →</GuestText>
        </>
      )}
    </FooterContainer>
  );
};

export default AccountFooter;
