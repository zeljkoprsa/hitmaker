import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

import TempoTrainerForm from '../LeftSidebar/TempoTrainerForm';
import { BoltIcon, XIcon } from '../Sidebar/icons';

/** Tempo Trainer as a metronome mode: a quiet launcher button rendered under
 *  the metronome controls that opens the trainer configuration in a modal. */

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const LauncherRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 2px 0 8px;
`;

const LauncherBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 10px 14px;
  min-height: 40px;
  transition:
    color 150ms ease,
    background-color 150ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
    background: rgba(255, 255, 255, 0.04);
  }

  &:active {
    background: rgba(255, 255, 255, 0.07);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  z-index: ${({ theme }) => theme.zIndices.modal + 5};
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 24px 16px 48px;
  animation: ${fadeIn} 150ms ease-out;

  @media (min-width: 768px) {
    align-items: center;
    padding: 48px 24px;
  }
`;

const Dialog = styled.div`
  background: ${({ theme }) => theme.colors.metronome.background};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  width: 100%;
  max-width: 420px;
  padding: 20px;
  position: relative;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
`;

const DialogTitle = styled.h2`
  margin: 0 0 16px;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  letter-spacing: -0.01em;
`;

const DialogClose = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
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
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.metronome.primary};
  }
`;

export const TempoTrainerMode: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <LauncherRow>
        <LauncherBtn onClick={() => setIsOpen(true)} aria-haspopup="dialog">
          <BoltIcon size={13} />
          Tempo Trainer
        </LauncherBtn>
      </LauncherRow>

      {isOpen && (
        <Overlay onClick={() => setIsOpen(false)}>
          <Dialog
            role="dialog"
            aria-modal="true"
            aria-label="Tempo Trainer"
            onClick={e => e.stopPropagation()}
          >
            <DialogTitle>Tempo Trainer</DialogTitle>
            <DialogClose onClick={() => setIsOpen(false)} aria-label="Close">
              <XIcon size={14} />
            </DialogClose>
            <TempoTrainerForm onStart={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />
          </Dialog>
        </Overlay>
      )}
    </>
  );
};

export default TempoTrainerMode;
