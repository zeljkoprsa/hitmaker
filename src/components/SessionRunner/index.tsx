import React, { useEffect, useState } from 'react';

import { useSession } from '../../context/SessionContext';

import {
  CountdownLabel,
  CountdownNumber,
  EndButton,
  IconButton,
  NextButton,
  PreviewBlock,
  PreviewDivider,
  PreviewFooter,
  PreviewInstructions,
  PreviewMeta,
  PreviewOverlay,
  PreviewTitle,
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
  const {
    activeSession,
    currentBlockIndex,
    blockStartedAt,
    sessionPhase,
    countdown,
    beginSession,
    pauseSession,
    resumeSession,
    restartBlock,
    advanceBlock,
    endSession,
  } = useSession();

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!blockStartedAt || sessionPhase !== 'running') return;
    setElapsed(Math.floor((Date.now() - blockStartedAt.getTime()) / 1000));
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - blockStartedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [blockStartedAt, sessionPhase]);

  if (!activeSession) return null;

  const block = activeSession.blocks[currentBlockIndex];
  const totalSecs = Math.round(block.durationMinutes * 60);
  const remaining = totalSecs - elapsed;
  const overtime = remaining < 0;
  const isLast = currentBlockIndex === activeSession.blocks.length - 1;
  const totalMin = activeSession.blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const blockCount = activeSession.blocks.length;

  // --- Preview overlay ---
  if (sessionPhase === 'preview') {
    const first = activeSession.blocks[0];
    const firstBlockInfo = [
      `${first.tempo} BPM`,
      `${first.timeSignature.beats}/${first.timeSignature.noteValue}`,
      first.label,
    ]
      .filter(Boolean)
      .join(' · ');

    return (
      <PreviewOverlay>
        <PreviewTitle>{activeSession.name}</PreviewTitle>
        <PreviewMeta>
          {blockCount === 1 ? '1 block' : `${blockCount} blocks`} · {totalMin} min
        </PreviewMeta>
        <PreviewBlock>{firstBlockInfo}</PreviewBlock>
        <PreviewDivider />
        <PreviewInstructions>Set your posture, find the tempo, take a breath.</PreviewInstructions>
        <PreviewFooter>
          <NextButton onClick={beginSession}>Let&apos;s Go</NextButton>
          <EndButton onClick={endSession} aria-label="Cancel">
            &#x2715;
          </EndButton>
        </PreviewFooter>
      </PreviewOverlay>
    );
  }

  // --- Countdown overlay ---
  if (sessionPhase === 'countdown') {
    return (
      <PreviewOverlay>
        <CountdownNumber key={countdown}>{countdown}</CountdownNumber>
        <CountdownLabel>Get ready</CountdownLabel>
      </PreviewOverlay>
    );
  }

  // --- Runner bar (running / paused) ---
  const isPaused = sessionPhase === 'paused';
  const metaParts = [
    `${currentBlockIndex + 1}/${blockCount}`,
    block.label,
    `${block.tempo} BPM · ${block.timeSignature.beats}/${block.timeSignature.noteValue}`,
  ].filter(Boolean);

  return (
    <RunnerBar>
      <RunnerInfo>
        <RunnerName>{activeSession.name}</RunnerName>
        <RunnerMeta>{metaParts.join(' · ')}</RunnerMeta>
      </RunnerInfo>

      <RunnerTimer overtime={overtime && !isPaused}>
        {overtime ? `+${formatTime(-remaining)}` : formatTime(remaining)}
      </RunnerTimer>

      <IconButton
        onClick={isPaused ? resumeSession : pauseSession}
        aria-label={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? '▶' : '⏸'}
      </IconButton>

      <IconButton onClick={restartBlock} aria-label="Restart block">
        ↺
      </IconButton>

      <NextButton onClick={advanceBlock}>{isLast ? 'Done' : 'Next →'}</NextButton>

      <EndButton onClick={endSession} aria-label="End session">
        &#x2715;
      </EndButton>
    </RunnerBar>
  );
};

export default SessionRunner;
