import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import React, { useRef, useState } from 'react';

import { useResponsive } from '../../../../hooks/useResponsive';
import { useMetronome } from '../../context/MetronomeProvider';

const TempoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 166px;
  margin: 0 auto;
  padding: 0 6px;
`;

const TempoButton = styled(motion.button)`
  background: none;
  color: ${props => props.theme.colors.metronome.primary};
  border: none;
  width: 32px;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: ${props => props.theme.typography.fontFamily.base};
  font-size: ${props => props.theme.typography.fontSizes.md};
  font-weight: ${props => props.theme.typography.fontWeights.medium};
  position: relative;
  z-index: 2;
  padding: 10px;

  &:disabled {
    color: ${props => props.theme.colors.metronome.primary};
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:hover:not(:disabled) {
    color: ${props => props.theme.colors.metronome.accent};
  }

  &:active:not(:disabled) {
    color: ${props => props.theme.colors.metronome.accent};
    opacity: 0.8;
  }
`;

/** The value doubles as a direct-entry field (JAK-49): tap/click to type an
 *  exact BPM, commit on blur/Enter, Escape reverts. Styled as the display it
 *  replaces — no chrome until focused. */
const TempoInput = styled.input`
  font-family: ${props => props.theme.typography.fontFamily.base};
  font-size: ${props => props.theme.typography.fontSizes.xxxl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.metronome.primary};
  background: none;
  border: none;
  border-radius: ${props => props.theme.borders.radius.sm};
  width: 84px;
  padding: 0;
  text-align: center;
  position: relative;
  z-index: 1;
  outline: none;
  caret-color: ${props => props.theme.colors.metronome.accent};

  /* Hide number-input spinners — the flanking -/+ buttons are the steppers */
  appearance: textfield;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    background: rgba(255, 255, 255, 0.06);
  }
`;

const MIN_TEMPO = 30;
const MAX_TEMPO = 500;

const clampTempo = (bpm: number): number => Math.min(Math.max(bpm, MIN_TEMPO), MAX_TEMPO);

const TempoDisplay: React.FC = () => {
  const { tempo, setTempo } = useMetronome();
  const { isMobile: _isMobile } = useResponsive();

  // Non-null while the user is typing; committed on blur/Enter. Mirrored in
  // a ref so Escape can cancel synchronously before the blur handler runs.
  const [draft, setDraftState] = useState<string | null>(null);
  const draftRef = useRef<string | null>(null);
  const setDraft = (value: string | null) => {
    draftRef.current = value;
    setDraftState(value);
  };

  const handleTempoChange = (delta: number) => {
    setTempo(clampTempo(tempo + delta));
  };

  const commitDraft = () => {
    const pending = draftRef.current;
    setDraft(null);
    if (pending !== null) {
      const parsed = parseInt(pending, 10);
      // Empty or non-numeric input reverts to the current tempo
      if (!isNaN(parsed)) setTempo(clampTempo(parsed));
    }
  };

  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
    disabled: { opacity: 0.5 },
  };

  return (
    <TempoContainer>
      <TempoButton
        onClick={() => handleTempoChange(-1)}
        disabled={tempo <= MIN_TEMPO}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        animate={tempo <= MIN_TEMPO ? 'disabled' : ''}
      >
        -
      </TempoButton>
      <TempoInput
        type="number"
        inputMode="numeric"
        min={MIN_TEMPO}
        max={MAX_TEMPO}
        aria-label="Tempo in BPM"
        value={draft ?? String(tempo)}
        onFocus={e => {
          setDraft(String(tempo));
          e.target.select();
        }}
        onChange={e => setDraft(e.target.value)}
        onBlur={commitDraft}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.currentTarget.blur(); // commits via onBlur
          } else if (e.key === 'Escape') {
            setDraft(null);
            e.currentTarget.blur();
          }
          // Arrow keys keep native stepping inside the field; the global
          // tempo shortcuts are guarded by isInputFocused and stay out
          e.stopPropagation();
        }}
      />
      <TempoButton
        onClick={() => handleTempoChange(1)}
        disabled={tempo >= MAX_TEMPO}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        animate={tempo >= MAX_TEMPO ? 'disabled' : ''}
      >
        +
      </TempoButton>
    </TempoContainer>
  );
};

export default TempoDisplay;
