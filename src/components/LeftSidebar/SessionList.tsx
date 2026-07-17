import styled from '@emotion/styled';
import React from 'react';

import { useSession } from '../../context/SessionContext';
import { PracticeSession } from '../../core/types/SessionTypes';
import { PlayIcon, PlusIcon } from '../Sidebar/icons';

interface SessionListProps {
  onEdit: (session: PracticeSession) => void;
  onNew: () => void;
  /** Called when a session run starts (the view switches to the metronome). */
  onClose: () => void;
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
  flex-direction: column;
  gap: 8px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
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

const CircleBtn = styled.button`
  width: 32px;
  height: 32px;
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

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.metronome.accent};
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    color: white;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover:not(:disabled) {
      background: transparent;
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.7);
    }

    &:active:not(:disabled) {
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
`;

const Meta = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.35);
`;

const Actions = styled.div`
  display: flex;
  gap: 4px;
`;

const TextBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
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

const DeleteBtn = styled(TextBtn)`
  &:hover {
    color: var(--color-error, #ff4d4f);
    background: rgba(255, 77, 79, 0.08);
  }
`;

const NewButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
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

const EmptyState = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 32px 12px;
  line-height: 1.5;
`;

const formatMeta = (session: PracticeSession): string => {
  const total = session.blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const blockLabel = session.blocks.length === 1 ? '1 block' : `${session.blocks.length} blocks`;
  return `${blockLabel} · ${total} min`;
};

const SessionList: React.FC<SessionListProps> = ({ onEdit, onNew, onClose }) => {
  const { sessions, deleteSession, duplicateSession, startSession } = useSession();

  const handleStart = (s: PracticeSession) => {
    startSession(s);
    onClose();
  };

  return (
    <>
      {sessions.length === 0 ? (
        <EmptyState>
          No sessions yet.
          <br />
          Create one below, or copy a workout from the Catalog.
        </EmptyState>
      ) : (
        <List>
          {sessions.map(s => (
            <Card key={s.id}>
              <CardTop>
                <SessionName>{s.name}</SessionName>
                <CircleBtn
                  onClick={() => handleStart(s)}
                  aria-label={`Start ${s.name}`}
                  disabled={s.blocks.length === 0}
                >
                  <PlayIcon size={13} />
                </CircleBtn>
              </CardTop>
              <CardBottom>
                <Meta>{formatMeta(s)}</Meta>
                <Actions>
                  <TextBtn onClick={() => onEdit(s)}>Edit</TextBtn>
                  <TextBtn onClick={() => duplicateSession(s)}>Copy</TextBtn>
                  <DeleteBtn onClick={() => deleteSession(s.id)}>Delete</DeleteBtn>
                </Actions>
              </CardBottom>
            </Card>
          ))}
        </List>
      )}

      <NewButton onClick={onNew}>
        <PlusIcon size={13} />
        New Session
      </NewButton>
    </>
  );
};

export default SessionList;
