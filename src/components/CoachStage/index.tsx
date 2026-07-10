import React from 'react';

import { useSession } from '../../context/SessionContext';
import { SessionBlock } from '../../core/types/SessionTypes';
import { blockDrivesMetronome, blockHasCountdown } from '../../core/utils/sessionBlocks';
import { formatBlockTime, useBlockRemaining } from '../../hooks/useBlockRemaining';
import { useWakeLock } from '../../hooks/useWakeLock';

import {
  BlockCard,
  BlockTitle,
  Countdown,
  Eyebrow,
  ItemDot,
  ItemList,
  ItemRow,
  ItemText,
  NextUp,
  PausedBadge,
  Prose,
  ReadyButton,
  RunProgress,
  SilentChip,
  Stage,
  TempoChip,
} from './styles';

/** Short "what's coming" line for break/teach blocks. */
const nextUpLabel = (next: SessionBlock | undefined): string | null => {
  if (!next) return null;
  const tempo = next.tempo != null ? ` · ${next.tempo} BPM` : '';
  return `${next.label ?? 'Next block'}${tempo}`;
};

/**
 * Center stage during a guided lesson run: renders the current block by type
 * while the metronome lives in the bottom runner bar. Purely a display over
 * SessionContext — the same state machine that drives Starter runs.
 */
export const CoachStage: React.FC = () => {
  const { activeSession, currentBlockIndex, sessionPhase, advanceBlock } = useSession();
  const remaining = useBlockRemaining();

  // Keep the screen awake for the whole run, including silent teach/break
  // blocks (the metronome's own wake lock only covers while it plays)
  useWakeLock(true);

  if (!activeSession) return null;

  const block = activeSession.blocks[currentBlockIndex];
  const next = activeSession.blocks[currentBlockIndex + 1];
  const isLast = currentBlockIndex === activeSession.blocks.length - 1;
  const isPaused = sessionPhase === 'paused';
  const content = block.content;

  const countdownText =
    blockHasCountdown(block) && remaining !== null ? formatBlockTime(Math.max(0, remaining)) : null;

  return (
    <Stage dimmed={isPaused}>
      <BlockCard key={block.id}>
        <RunProgress>
          {activeSession.name} · {currentBlockIndex + 1}/{activeSession.blocks.length}
        </RunProgress>

        {isPaused && <PausedBadge>Paused</PausedBadge>}

        {block.type === 'break' ? (
          <>
            <Eyebrow>Break</Eyebrow>
            <BlockTitle>Rest</BlockTitle>
            {countdownText && <Countdown resting>{countdownText}</Countdown>}
            {next && (
              <NextUp>
                Next up: <strong>{nextUpLabel(next)}</strong>
              </NextUp>
            )}
          </>
        ) : (
          <>
            {content?.eyebrow && <Eyebrow>{content.eyebrow}</Eyebrow>}
            <BlockTitle>{block.label ?? activeSession.name}</BlockTitle>

            {block.type === 'do' &&
              (blockDrivesMetronome(block) ? (
                <TempoChip>
                  {block.tempo} BPM
                  {block.timeSignature &&
                    ` · ${block.timeSignature.beats}/${block.timeSignature.noteValue}`}
                </TempoChip>
              ) : (
                <SilentChip>No click — free play</SilentChip>
              ))}

            {countdownText && <Countdown>{countdownText}</Countdown>}

            {content?.items && content.items.length > 0 && (
              <ItemList>
                {content.items.map((item, i) => (
                  <ItemRow key={i}>
                    <ItemDot />
                    <ItemText>
                      {item.text}
                      {item.note && <em> — {item.note}</em>}
                    </ItemText>
                  </ItemRow>
                ))}
              </ItemList>
            )}

            {content?.prose && <Prose>{content.prose}</Prose>}

            {block.type === 'teach' && (
              <>
                {next && (
                  <NextUp>
                    Up next: <strong>{nextUpLabel(next)}</strong>
                  </NextUp>
                )}
                <ReadyButton onClick={advanceBlock}>{isLast ? 'Finish ✓' : 'Ready →'}</ReadyButton>
              </>
            )}
          </>
        )}
      </BlockCard>
    </Stage>
  );
};

export default CoachStage;
