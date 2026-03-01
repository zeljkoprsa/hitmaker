import styled from '@emotion/styled';
import React from 'react';

import { SessionHistoryEntry } from '../../core/types/SessionTypes';
import { useSessionHistory } from '../../hooks/useSessionHistory';
import { SectionHeader } from '../Sidebar/styles';

interface SessionHistoryProps {
  onBack: () => void;
}

const StreakBanner = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  margin-bottom: 20px;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HistoryCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.35);
`;

const EmptyState = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 40px 0;
`;

const LoadingState = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 40px 0;
`;

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDateLabel = (iso: string): string => {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86_400_000);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const groupByDate = (
  entries: SessionHistoryEntry[]
): { label: string; entries: SessionHistoryEntry[] }[] => {
  const groups: Map<string, SessionHistoryEntry[]> = new Map();
  for (const entry of entries) {
    const label = getDateLabel(entry.completedAt);
    const existing = groups.get(label);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(label, [entry]);
    }
  }
  return Array.from(groups.entries()).map(([label, entries]) => ({ label, entries }));
};

const SessionHistory: React.FC<SessionHistoryProps> = () => {
  const { history, loading, streak } = useSessionHistory();

  if (loading) {
    return <LoadingState>Loading history…</LoadingState>;
  }

  const groups = groupByDate(history);

  return (
    <>
      {streak > 0 && <StreakBanner>🔥 {streak}-day streak</StreakBanner>}

      {history.length === 0 ? (
        <EmptyState>No completed sessions yet</EmptyState>
      ) : (
        groups.map(({ label, entries }) => (
          <div key={label}>
            <SectionHeader>{label}</SectionHeader>
            <HistoryList>
              {entries.map(entry => (
                <HistoryCard key={entry.id}>
                  <CardName>{entry.sessionName}</CardName>
                  <CardMeta>
                    {entry.blocksCompleted} {entry.blocksCompleted === 1 ? 'block' : 'blocks'} ·{' '}
                    {entry.totalDurationMinutes} min · {formatTime(entry.completedAt)}
                  </CardMeta>
                </HistoryCard>
              ))}
            </HistoryList>
          </div>
        ))
      )}
    </>
  );
};

export default SessionHistory;
