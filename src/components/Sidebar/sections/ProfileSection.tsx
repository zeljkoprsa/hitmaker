import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../../../context/AuthContext';
import { useMetronome } from '../../../features/Metronome/context/MetronomeProvider';
import { usePreferences } from '../../../hooks/usePreferences';
import { SectionHeader } from '../styles';

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
`;

const AvatarCircle = styled.div`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.metronome.accent} 0%,
    #d63a04 100%
  );
  color: white;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borders.radius.round};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  box-shadow: 0 4px 12px rgba(246, 65, 5, 0.25);
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  min-width: 0;
`;

const EmailText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ theme }) => theme.colors.metronome.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberSince = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
`;

const SyncRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
`;

const StatusDot = styled.span<{ color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${({ color }) => color};
  flex-shrink: 0;
`;

const SyncLabel = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;

const SyncTime = styled.span`
  margin-left: auto;
  color: rgba(255, 255, 255, 0.3);
`;

const getTimeAgo = (date: Date | null): string => {
  if (!date) return 'Never';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

const ProfileSection: React.FC = () => {
  const { user } = useAuth();
  const { isSaving } = useMetronome();
  const { preferences } = usePreferences();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
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

  useEffect(() => {
    if (!isSaving && preferences) {
      setLastSyncTime(new Date());
    }
  }, [isSaving, preferences]);

  if (!user) return null;

  const getSyncInfo = () => {
    if (!online) return { label: 'Offline', color: '#faad14' };
    if (isSaving) return { label: 'Syncing...', color: '#f64105' };
    return { label: 'Synced', color: '#52c41a' };
  };

  const sync = getSyncInfo();
  const initial = user.email ? user.email[0].toUpperCase() : 'U';

  return (
    <>
      <SectionHeader>Profile</SectionHeader>
      <UserRow>
        <AvatarCircle>{initial}</AvatarCircle>
        <UserInfo>
          <EmailText>{user.email}</EmailText>
          <MemberSince>
            Member since{' '}
            {new Date(user.created_at || '').toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            })}
          </MemberSince>
        </UserInfo>
      </UserRow>
      <SyncRow>
        <StatusDot color={sync.color} />
        <SyncLabel color={sync.color}>{sync.label}</SyncLabel>
        {!isSaving && online && lastSyncTime && <SyncTime>{getTimeAgo(lastSyncTime)}</SyncTime>}
      </SyncRow>
    </>
  );
};

export default ProfileSection;
