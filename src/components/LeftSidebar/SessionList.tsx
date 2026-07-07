import styled from '@emotion/styled';
import React from 'react';

import { useSession } from '../../context/SessionContext';
import { PracticeSession } from '../../core/types/SessionTypes';
import { STARTER_SESSIONS } from '../../features/Sessions/starterSessions';
import { BoltIcon, ChevronRightIcon, PlayIcon, PlusIcon } from '../Sidebar/icons';
import { SectionHeader } from '../Sidebar/styles';

interface SessionListProps {
  onEdit: (session: PracticeSession) => void;
  onNew: () => void;
  onClose: () => void;
  onTrainer: () => void;
  onHistory: () => void;
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
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: background-color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SessionName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StartButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.metronome.accent};
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    color: white;
  }

  &:active {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.7);
    }

    &:active {
      background: ${({ theme }) => theme.colors.metronome.accent};
      border-color: ${({ theme }) => theme.colors.metronome.accent};
      color: white;
    }
  }
`;

const CardBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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

const TrainerButton = styled.button`
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: ${({ theme }) => theme.colors.metronome.primary};
  cursor: pointer;
  padding: 10px 12px;
  min-height: 44px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }

  &:active {
    background: rgba(255, 255, 255, 0.07);
  }
`;

const TrainerIconTile = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  background: rgba(246, 65, 5, 0.12);
  color: ${({ theme }) => theme.colors.metronome.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TrainerInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TrainerTitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
`;

const TrainerSubtitle = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.4);
`;

const TrainerChevron = styled.span`
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const HistoryButton = styled.button`
  width: 100%;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.35);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  cursor: pointer;
  padding: 10px 12px;
  min-height: 40px;
  margin-top: 4px;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 4px;
  transition:
    color 150ms ease,
    background-color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    background: rgba(255, 255, 255, 0.04);
  }

  &:active {
    background: rgba(255, 255, 255, 0.07);
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
    <CardInfo>
      <SessionName>{session.name}</SessionName>
      <CardBottom>
        <Meta>{formatMeta(session)}</Meta>
        <Actions>
          {!isStarter && onEdit && <IconButton onClick={onEdit}>Edit</IconButton>}
          <IconButton onClick={onDuplicate}>Copy</IconButton>
          {!isStarter && onDelete && <DeleteButton onClick={onDelete}>Delete</DeleteButton>}
        </Actions>
      </CardBottom>
    </CardInfo>
    <StartButton
      onClick={onStart}
      disabled={session.blocks.length === 0}
      aria-label={`Start ${session.name}`}
    >
      <PlayIcon size={14} />
    </StartButton>
  </Card>
);

const SessionList: React.FC<SessionListProps> = ({
  onEdit,
  onNew,
  onClose,
  onTrainer,
  onHistory,
}) => {
  const { sessions, deleteSession, duplicateSession, startSession } = useSession();

  const handleStart = (s: PracticeSession) => {
    startSession(s);
    onClose();
  };

  return (
    <>
      <SectionHeader>Tools</SectionHeader>
      <TrainerButton onClick={onTrainer}>
        <TrainerIconTile>
          <BoltIcon size={15} />
        </TrainerIconTile>
        <TrainerInfo>
          <TrainerTitle>Tempo Trainer</TrainerTitle>
          <TrainerSubtitle>Build speed from start to end BPM</TrainerSubtitle>
        </TrainerInfo>
        <TrainerChevron>
          <ChevronRightIcon />
        </TrainerChevron>
      </TrainerButton>

      <SectionHeader style={{ marginTop: 20 }}>Starters</SectionHeader>
      <List>
        {STARTER_SESSIONS.map(s => (
          <SessionCard
            key={s.id}
            session={s}
            isStarter
            onDuplicate={() => duplicateSession(s)}
            onStart={() => handleStart(s)}
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
                onStart={() => handleStart(s)}
              />
            ))}
          </List>
        </>
      )}

      <NewButton onClick={onNew}>
        <PlusIcon size={14} />
        New Session
      </NewButton>
      <HistoryButton onClick={onHistory}>
        Practice History
        <ChevronRightIcon size={14} />
      </HistoryButton>
    </>
  );
};

export default SessionList;
