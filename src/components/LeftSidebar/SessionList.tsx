import styled from '@emotion/styled';
import React from 'react';

import { useSession } from '../../context/SessionContext';
import { PracticeSession } from '../../core/types/SessionTypes';
import { STARTER_SESSIONS } from '../../features/Sessions/starterSessions';
import { SectionHeader } from '../Sidebar/styles';

interface SessionListProps {
  onEdit: (session: PracticeSession) => void;
  onNew: () => void;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SessionName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StartButton = styled.button`
  background: ${({ theme }) => theme.colors.metronome.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  padding: 6px 10px;
  min-height: 30px;
  flex-shrink: 0;
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    opacity: 0.7;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const CardBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Meta = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.35);
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  cursor: pointer;
  padding: 4px 6px;
  min-height: 28px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition:
    color 150ms ease,
    background-color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    background: rgba(255, 255, 255, 0.06);
  }

  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DeleteButton = styled(IconButton)`
  &:hover {
    color: var(--color-error, #ff4d4f);
    background: rgba(255, 77, 79, 0.08);
  }
`;

const NewButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  padding: 12px;
  min-height: 44px;
  margin-top: 8px;
  transition:
    color 150ms ease,
    border-color 150ms ease,
    background-color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.06);
  }
`;

const formatMeta = (session: PracticeSession): string => {
  const total = session.blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const blockLabel = session.blocks.length === 1 ? '1 block' : `${session.blocks.length} blocks`;
  return `${blockLabel} · ${total} min`;
};

const SessionCard: React.FC<{
  session: PracticeSession;
  isStarter?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate: () => void;
  onStart: () => void;
}> = ({ session, isStarter, onEdit, onDelete, onDuplicate, onStart }) => (
  <Card>
    <CardTop>
      <SessionName>{session.name}</SessionName>
      <StartButton onClick={onStart} disabled={session.blocks.length === 0}>
        Start
      </StartButton>
    </CardTop>
    <CardBottom>
      <Meta>{formatMeta(session)}</Meta>
      <Actions>
        {!isStarter && onEdit && <IconButton onClick={onEdit}>Edit</IconButton>}
        <IconButton onClick={onDuplicate}>Copy</IconButton>
        {!isStarter && onDelete && <DeleteButton onClick={onDelete}>Delete</DeleteButton>}
      </Actions>
    </CardBottom>
  </Card>
);

const SessionList: React.FC<SessionListProps> = ({ onEdit, onNew }) => {
  const { sessions, deleteSession, duplicateSession, startSession } = useSession();

  return (
    <>
      <SectionHeader>Starters</SectionHeader>
      <List>
        {STARTER_SESSIONS.map(s => (
          <SessionCard
            key={s.id}
            session={s}
            isStarter
            onDuplicate={() => duplicateSession(s)}
            onStart={() => startSession(s)}
          />
        ))}
      </List>

      {sessions.length > 0 && (
        <>
          <SectionHeader style={{ marginTop: 20 }}>My Sessions</SectionHeader>
          <List>
            {sessions.map(s => (
              <SessionCard
                key={s.id}
                session={s}
                onEdit={() => onEdit(s)}
                onDelete={() => deleteSession(s.id)}
                onDuplicate={() => duplicateSession(s)}
                onStart={() => startSession(s)}
              />
            ))}
          </List>
        </>
      )}

      <NewButton onClick={onNew}>+ New Session</NewButton>
    </>
  );
};

export default SessionList;
