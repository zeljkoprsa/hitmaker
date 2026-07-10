import React, { useEffect, useState } from 'react';

import { useSession } from '../../context/SessionContext';
import { blockHasCountdown } from '../../core/utils/sessionBlocks';
import { useMetronome } from '../../features/Metronome/context/MetronomeProvider';
import { formatBlockTime, useBlockRemaining } from '../../hooks/useBlockRemaining';

import {
  BeatDot,
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

/** Live metronome presence in the runner bar while center stage is taken by
 *  the coach view: pulses on every beat, dims when the block is silent. */
const BeatPulse: React.FC = () => {
  const { onTick, isPlaying } = useMetronome();
  const [beatNonce, setBeatNonce] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const unsubscribe = onTick(event => {
      if (Number.isInteger(event.beatNumber)) setBeatNonce(n => n + 1);
    });
    return () => {
      unsubscribe();
    };
  }, [onTick, isPlaying]);

  return <BeatDot key={beatNonce} silent={!isPlaying} aria-hidden />;
};

export const SessionRunner: React.FC = () => {
  const {
    activeSession,
    currentBlockIndex,
    sessionPhase,
    countdown,
    beginSession,
    pauseSession,
    resumeSession,
    restartBlock,
    advanceBlock,
    endSession,
  } = useSession();

  const remaining = useBlockRemaining() ?? 0;

  if (!activeSession) return null;

  const block = activeSession.blocks[currentBlockIndex];
  const overtime = remaining < 0;
  const isLast = currentBlockIndex === activeSession.blocks.length - 1;
  const totalMin = activeSession.blocks.reduce((s, b) => s + b.durationMinutes, 0);
  const blockCount = activeSession.blocks.length;
  const guided = Boolean(activeSession.guided);

  // --- Preview overlay ---
  if (sessionPhase === 'preview') {
    const first = activeSession.blocks[0];
    const firstBlockInfo = [
      first.tempo != null ? `${first.tempo} BPM` : null,
      first.timeSignature ? `${first.timeSignature.beats}/${first.timeSignature.noteValue}` : null,
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
  // During a guided run this bar is the metronome's display slot: the click
  // keeps running here (tempo, beat pulse, clock) while the current block
  // holds center stage.
  const isPaused = sessionPhase === 'paused';
  const tempoInfo =
    block.tempo != null
      ? `${block.tempo} BPM${
          block.timeSignature
            ? ` · ${block.timeSignature.beats}/${block.timeSignature.noteValue}`
            : ''
        }`
      : guided
        ? 'no click'
        : null;
  const metaParts = [`${currentBlockIndex + 1}/${blockCount}`, block.label, tempoInfo].filter(
    Boolean
  );
  const showTimer = blockHasCountdown(block);

  return (
    <RunnerBar>
      {guided && <BeatPulse />}
      <RunnerInfo>
        <RunnerName>{activeSession.name}</RunnerName>
        <RunnerMeta>{metaParts.join(' · ')}</RunnerMeta>
      </RunnerInfo>

      {showTimer && (
        <RunnerTimer overtime={overtime && !isPaused}>
          {overtime ? `+${formatBlockTime(-remaining)}` : formatBlockTime(remaining)}
        </RunnerTimer>
      )}

      <IconButton
        onClick={isPaused ? resumeSession : pauseSession}
        aria-label={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? '▶' : '⏸'}
      </IconButton>

      <IconButton onClick={restartBlock} aria-label="Restart block">
        ↺
      </IconButton>

      <NextButton onClick={advanceBlock}>
        {isLast ? 'Done' : block.type === 'teach' ? 'Ready →' : 'Next →'}
      </NextButton>

      <EndButton onClick={endSession} aria-label="End session">
        &#x2715;
      </EndButton>
    </RunnerBar>
  );
};

export default SessionRunner;
