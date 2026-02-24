import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';

interface UserAvatarProps {
  onOpen: () => void;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const AvatarButton = styled.button`
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borders.radius.round};
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;

const AvatarCircle = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.metronome.accent} 0%,
    #d63a04 100%
  );
  color: white;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borders.radius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  box-shadow: 0 2px 8px rgba(246, 65, 5, 0.3);
`;

const GuestIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borders.radius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
`;

interface SyncDotProps {
  status: 'synced' | 'saving' | 'offline';
}

const SyncDot = styled.div<SyncDotProps>`
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  border: 1.5px solid #1c1c1c;

  ${({ status, theme }) => {
    switch (status) {
      case 'offline':
        return `background: ${theme.colors.warning};`;
      case 'saving':
        return `
          background: ${theme.colors.metronome.accent};
          animation: ${pulse} 1s ease-in-out infinite;
        `;
      case 'synced':
      default:
        return `background: ${theme.colors.success};`;
    }
  }}
`;

const UserAvatar: React.FC<UserAvatarProps> = ({ onOpen }) => {
  const { user, loading } = useAuth();
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

  if (loading) {
    return <div style={{ width: 44, height: 44 }} />;
  }

  const getSyncStatus = (): 'synced' | 'saving' | 'offline' => {
    if (!online) return 'offline';
    if (isSaving) return 'saving';
    return 'synced';
  };

  const initial = user?.email ? user.email[0].toUpperCase() : '';
  const label = user ? 'Account settings' : 'Sign in';

  return (
    <AvatarButton onClick={onOpen} aria-label={label}>
      {user ? (
        <>
          <AvatarCircle>{initial}</AvatarCircle>
          <SyncDot status={getSyncStatus()} title={getSyncStatus()} />
        </>
      ) : (
        <GuestIcon aria-hidden="true">
          {/* Generic user silhouette */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
              fill="currentColor"
            />
          </svg>
        </GuestIcon>
      )}
    </AvatarButton>
  );
};

export default UserAvatar;
