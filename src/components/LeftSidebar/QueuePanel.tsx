import styled from '@emotion/styled';
import React from 'react';

import { QueueItem, useQueue } from '../../context/QueueContext';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, PlayIcon, XIcon } from '../Sidebar/icons';

interface QueuePanelProps {
  onClose: () => void;
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Card = styled.div<{ isCurrent?: boolean }>`
  background: ${({ isCurrent }) =>
    isCurrent ? 'rgba(246, 65, 5, 0.06)' : 'rgba(255, 255, 255, 0.03)'};
  border: 1px solid
    ${({ isCurrent }) => (isCurrent ? 'rgba(246, 65, 5, 0.35)' : 'rgba(255, 255, 255, 0.06)')};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Position = styled.span<{ isCurrent?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ isCurrent, theme }) =>
    isCurrent ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.3)'};
  flex-shrink: 0;
  width: 18px;
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.35);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TypeBadge = styled.span`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  padding: 2px 8px;
  flex-shrink: 0;
`;

/** Non-blocking placeholder for a queued My Session that hasn't finished
 *  syncing to this device yet. */
const SyncingBadge = styled(TypeBadge)`
  color: ${({ theme }) => theme.colors.metronome.accent};
  background: rgba(246, 65, 5, 0.1);
  animation: queue-syncing-pulse 1.4s ease-in-out infinite;

  @keyframes queue-syncing-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }
`;

const IconBtn = styled.button`
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    color 150ms ease,
    background-color 150ms ease;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.metronome.primary};
    background: rgba(255, 255, 255, 0.06);
  }

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`;

const RemoveBtn = styled(IconBtn)`
  &:hover:not(:disabled) {
    color: var(--color-error, #ff4d4f);
    background: rgba(255, 77, 79, 0.08);
  }
`;

const CurrentActions = styled.div`
  display: flex;
  gap: 8px;
`;

const StartBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${({ theme }) => theme.colors.metronome.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 8px 10px;
  min-height: 34px;
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.85;
  }
`;

const DoneBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: rgba(255, 255, 255, 0.6);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 8px 10px;
  min-height: 34px;
  transition:
    color 150ms ease,
    border-color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
    border-color: rgba(255, 255, 255, 0.25);
  }
`;

const EmptyState = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 48px 12px;
  line-height: 1.5;
`;

const typeLabel = (item: QueueItem): string => {
  if (item.refType === 'lesson') return 'Lesson';
  if (item.refType === 'starter') return 'Starter';
  return 'Session';
};

const QueuePanel: React.FC<QueuePanelProps> = ({ onClose }) => {
  const {
    queue,
    removeFromQueue,
    moveItem,
    startCurrent,
    completeCurrent,
    isItemPending,
    currentItemId,
  } = useQueue();

  if (queue.length === 0) {
    return (
      <EmptyState>
        Queue is empty.
        <br />
        Add lessons and starters from the Catalog, or your own sessions from My Sessions.
      </EmptyState>
    );
  }

  const handleStart = () => {
    startCurrent();
    onClose();
  };

  return (
    <List>
      {queue.map((item, index) => {
        const pending = isItemPending(item);
        const isCurrent = item.id === currentItemId;
        return (
          <Card key={item.id} isCurrent={isCurrent}>
            <Row>
              <Position isCurrent={isCurrent}>{index + 1}</Position>
              <Info>
                <Title>{item.title}</Title>
                {item.meta && <Meta>{item.meta}</Meta>}
              </Info>
              {pending ? (
                <SyncingBadge>Syncing…</SyncingBadge>
              ) : (
                <TypeBadge>{typeLabel(item)}</TypeBadge>
              )}
              <IconBtn
                onClick={() => moveItem(item.id, -1)}
                disabled={index === 0}
                aria-label={`Move ${item.title} up`}
              >
                <ChevronUpIcon size={14} />
              </IconBtn>
              <IconBtn
                onClick={() => moveItem(item.id, 1)}
                disabled={index === queue.length - 1}
                aria-label={`Move ${item.title} down`}
              >
                <ChevronDownIcon size={14} />
              </IconBtn>
              <RemoveBtn
                onClick={() => removeFromQueue(item.id)}
                aria-label={`Remove ${item.title} from queue`}
              >
                <XIcon size={12} />
              </RemoveBtn>
            </Row>
            {isCurrent && (
              <CurrentActions>
                <StartBtn onClick={handleStart}>
                  <PlayIcon size={12} />
                  Start
                </StartBtn>
                <DoneBtn onClick={completeCurrent}>
                  <CheckIcon size={13} />
                  Mark done
                </DoneBtn>
              </CurrentActions>
            )}
          </Card>
        );
      })}
    </List>
  );
};

export default QueuePanel;
