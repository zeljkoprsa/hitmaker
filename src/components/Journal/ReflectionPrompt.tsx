import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import { useJournal } from '../../context/JournalContext';

/**
 * Optional post-run reflection (spec #6). Appears once after a run ends —
 * "how did that go?" — and is genuinely optional: Skip is frictionless, there
 * is no nag, badge, or guilt, and most runs will carry no note. The receipt
 * (sections, tempos, duration) was already captured automatically; this is
 * only the part the app can't know.
 */

const slideUp = keyframes`
  from { opacity: 0; transform: translate(-50%, 12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

const Card = styled.div`
  position: fixed;
  left: 50%;
  /* Above the mobile bottom nav (JAK-50); the nav owns the safe area */
  bottom: calc(16px + var(--app-bottom-nav, env(safe-area-inset-bottom, 0)));
  transform: translateX(-50%);
  z-index: ${({ theme }) => theme.zIndices.popover};
  width: min(440px, calc(100vw - 24px));
  background: rgba(28, 28, 28, 0.98);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  padding: 16px;
  animation: ${slideUp} 220ms ease-out;
`;

const TopRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`;

const Title = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
`;

const RunName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 45%;
`;

const Textarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 72px;
  resize: vertical;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 10px 12px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  line-height: 1.5;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
`;

const SkipBtn = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 9px 14px;
  min-height: 40px;
  border-radius: ${({ theme }) => theme.borders.radius.md};

  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
`;

const SaveBtn = styled.button`
  background: ${({ theme }) => theme.colors.metronome.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 9px 18px;
  min-height: 40px;
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.85;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`;

export const ReflectionPrompt: React.FC = () => {
  const { pendingReflection, updateReflection, dismissReflection } = useJournal();
  const [text, setText] = useState('');

  // Reset the field each time a new run surfaces a prompt
  useEffect(() => {
    setText('');
  }, [pendingReflection?.id]);

  // Escape skips — dismissing must be frictionless
  useEffect(() => {
    if (!pendingReflection) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissReflection();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingReflection, dismissReflection]);

  if (!pendingReflection) return null;

  const save = () => {
    const trimmed = text.trim();
    if (trimmed) updateReflection(pendingReflection.id, trimmed);
    dismissReflection();
  };

  return (
    <Card role="dialog" aria-label="Add a reflection">
      <TopRow>
        <Title>How did that go?</Title>
        <RunName>{pendingReflection.name}</RunName>
      </TopRow>
      <Textarea
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Optional — what felt good, what to work on next time…"
      />
      <Actions>
        <SkipBtn onClick={dismissReflection}>Skip</SkipBtn>
        <SaveBtn onClick={save} disabled={text.trim() === ''}>
          Save note
        </SaveBtn>
      </Actions>
    </Card>
  );
};

export default ReflectionPrompt;
