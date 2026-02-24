import React, { useEffect, useState } from 'react';

import { useSession } from '../../context/SessionContext';

import {
  EndButton,
  NextButton,
  RunnerBar,
  RunnerInfo,
  RunnerMeta,
  RunnerName,
  RunnerTimer,
} from './styles';

const formatTime = (seconds: number): string => {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

export const SessionRunner: React.FC = () => {
  const { activeSession, currentBlockIndex, blockStartedAt, advanceBlock, endSession } =
    useSession();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!blockStartedAt) {
      setElapsed(0);
      return;
    }
    setElapsed(0);
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - blockStartedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [blockStartedAt]);

  if (!activeSession) return null;

  const block = activeSession.blocks[currentBlockIndex];
  const totalSecs = Math.round(block.durationMinutes * 60);
  const remaining = totalSecs - elapsed;
  const overtime = remaining < 0;
  const isLast = currentBlockIndex === activeSession.blocks.length - 1;

  const metaParts = [
    `${currentBlockIndex + 1}/${activeSession.blocks.length}`,
    block.label,
    `${block.tempo} BPM · ${block.timeSignature.beats}/${block.timeSignature.noteValue}`,
  ].filter(Boolean);

  return (
    <RunnerBar>
      <RunnerInfo>
        <RunnerName>{activeSession.name}</RunnerName>
        <RunnerMeta>{metaParts.join(' · ')}</RunnerMeta>
      </RunnerInfo>

      <RunnerTimer overtime={overtime}>
        {overtime ? `+${formatTime(-remaining)}` : formatTime(remaining)}
      </RunnerTimer>

      <NextButton onClick={advanceBlock}>{isLast ? 'Done' : 'Next →'}</NextButton>

      <EndButton onClick={endSession} aria-label="End session">
        &#x2715;
      </EndButton>
    </RunnerBar>
  );
};

export default SessionRunner;
