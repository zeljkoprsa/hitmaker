import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { transition } from '../../../../shared/styles/mixins';

// Interfaces for styled-components props
interface StartStopButtonProps {
  isPlaying: boolean;
}

interface TempoControlProps {
  isPlaying: boolean;
}

interface TapTempoButtonProps {
  isActive: boolean;
}

export const ControlContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
  width: 82px;
  height: 82px;
`;

export const DisplayButton = styled.button`
  width: 82px;
  height: 82px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  border: none;
  border-radius: 3px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  line-height: 1;
  text-align: center;
  cursor: pointer;
  ${transition()}

  span {
    display: inline-block;
    transform: translateY(2px);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

export const CollapsibleContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border-radius: 3px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  opacity: 0;
  visibility: hidden;
  ${transition()}
  z-index: 100;
  min-width: max-content;

  &[data-visible='true'] {
    opacity: 1;
    visibility: visible;
  }
`;

export const Label = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  color: inherit;
`;

export const StyledSelect = styled.select`
  padding: ${({ theme }) =>
    `${theme.spacing.sm} ${theme.spacing.xl} ${theme.spacing.sm} ${theme.spacing.sm}`};
  border-radius: 3px;
  border: ${({ theme }) => `${theme.borders.width.thin} solid ${theme.colors.metronome.primary}`};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right ${({ theme }) => theme.spacing.sm} center;
  background-repeat: no-repeat;
  background-size: 20px 20px;
  min-width: 80px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.metronome.accent};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

export const Divider = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: inherit;
  margin: 0 ${({ theme }) => theme.spacing.xs};
`;

// Tempo Control Styles
export const TempoControlContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 600px;
  gap: ${({ theme }) => theme.spacing.xl};
`;

export const TempoControlStyled = styled.div<TempoControlProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.metronome.background};
  ${transition({ properties: ['background-color', 'transform'] })}

  &:hover {
    background-color: ${({ theme }) => theme.colors.metronome.background};
  }
`;

export const TempoInput = styled.input`
  width: 80px;
  padding: ${({ theme }) => theme.spacing.xs};
  border: ${({ theme }) => `${theme.borders.width.thin} solid ${theme.colors.metronome.primary}`};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.metronome.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  text-align: center;
  ${transition({ properties: ['border-color', 'box-shadow'] })}

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.metronome.accent};
  }
`;

export const TempoButton = styled.button`
  padding: ${({ theme }) => theme.spacing.xs};
  border: none;
  border-radius: 3px;
  background: none;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  ${transition({ properties: ['color', 'transform'] })}

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
  }
`;

export const TempoControlButton = styled.button`
  width: ${({ theme }) => theme.spacing.xl};
  height: ${({ theme }) => theme.spacing.xl};
  border-radius: 3px;
  border: none;
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  ${transition({ properties: 'background-color' })}
  background-color: ${({ theme }) => theme.colors.metronome.primary};

  &:hover {
    background-color: ${({ theme }) => theme.colors.metronome.accent};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

export const TempoSliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const TempoSlider = styled.input`
  width: 200px;
  height: ${({ theme }) => theme.spacing.md};
  -webkit-appearance: none;
  appearance: none;
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border-radius: 3px;
  outline: none;
  opacity: 0.7;
  ${transition({ properties: 'opacity' })}

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: ${({ theme }) => theme.spacing.lg};
    height: ${({ theme }) => theme.spacing.lg};
    background-color: ${({ theme }) => theme.colors.metronome.accent};
    border-radius: 3px;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: ${({ theme }) => theme.spacing.lg};
    height: ${({ theme }) => theme.spacing.lg};
    border: none;
    border-radius: 3px;
    background-color: ${({ theme }) => theme.colors.metronome.accent};
    cursor: pointer;
    ${transition({ properties: 'background-color' })}

    &:hover {
      background-color: ${({ theme }) => theme.colors.metronome.accent};
    }
  }
`;

export const TempoSliderContainerNew = styled.div`
  position: relative;
  width: 100%;
  height: 256px;
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  overflow: hidden;
  user-select: none;
  touch-action: none;
  will-change: transform;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 10%;
    pointer-events: none;
    z-index: 1;
  }

  &::before {
    left: 0;
    background: linear-gradient(
      to right,
      ${({ theme }) => theme.colors.metronome.background} 0%,
      transparent 100%
    );
  }

  &::after {
    right: 0;
    background: linear-gradient(
      to left,
      ${({ theme }) => theme.colors.metronome.background} 0%,
      transparent 100%
    );
  }
`;

export const GridContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;
`;

export const GridLine = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: ${({ theme }) => theme.colors.metronome.primary};
  opacity: 0.1;
  will-change: transform;
  backface-visibility: hidden;
`;

export const CenterLine = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  bottom: 0;
  width: 2px;
  background-color: ${({ theme }) => theme.colors.metronome.accent};
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(246, 65, 5, 0.3);
`;

export const SliderHandle = styled.div`
  position: absolute;
  top: 8px;
  left: 50%;
  width: 12px;
  height: 12px;
  background-color: ${({ theme }) => theme.colors.metronome.accent};
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 8px rgba(246, 65, 5, 0.5);
`;

// Time Signature Control Styles
export const TimeSignatureContainer = styled.div`
  position: relative;
  display: flex;
  border-radius: 3px;
`;

export const TimeSignatureList = styled(motion.div)`
  position: absolute;
  left: calc(82px + 2px); /* Button width + gap */
  top: 0;
  display: flex;
  gap: 2px;
  background-color: transparent;
  z-index: 1000;
  border-radius: 3px;
`;

// Subdivision Control Styles
export const SubdivisionContainer = styled.div`
  position: relative;
  display: flex;
  border-radius: 3px;
`;

export const SubdivisionList = styled(motion.div)`
  position: absolute;
  right: 100%;
  left: auto;
  top: 0;
  display: flex;
  gap: 2px;
  margin-right: 2px; /* Gap between button and dropdown */
  background-color: transparent;
  z-index: 1000;
  border-radius: 3px;
`;

// Define types for our custom props
interface CustomButtonProps {
  selected?: boolean;
}

// Create a motion button component that accepts a selected prop
const MotionButton = motion.button;

// Create a styled component that accepts the selected prop
export const TimeSignatureOption = styled(MotionButton)<CustomButtonProps>`
  width: 82px;
  height: 82px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-neutral-800);
  border: none;
  border-radius: 3px;
  margin: 0 1px;
  color: ${({ theme, selected }) =>
    selected ? theme.colors.metronome.accent : theme.colors.metronome.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  line-height: 1;
  text-align: center;
  cursor: pointer;
  transition: color 0.2s ease;

  span {
    display: inline-block;
    transform: translateY(2px);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

// Create a styled component that accepts the selected prop
export const SubdivisionOption = styled(MotionButton)<CustomButtonProps>`
  width: 82px;
  height: 82px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-neutral-800);
  border: none;
  border-radius: 3px;
  margin: 0 1px;
  color: ${({ theme, selected }) =>
    selected ? theme.colors.metronome.accent : theme.colors.metronome.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  line-height: 1;
  text-align: center;
  cursor: pointer;
  transition: color 0.2s ease;

  span {
    display: inline-block;
    transform: translateY(2px);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

// Tap Tempo Control Styles
export const TapTempoButton = styled.button<TapTempoButtonProps>`
  width: 102px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.metronome.buttonBackground};
  border: none;
  border-radius: var(--radius-full);
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.metronome.accent : theme.colors.metronome.primary};
  cursor: pointer;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  text-align: center;
  transition:
    transform 0.2s ease,
    color 0.2s ease;

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.metronome.accent};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

// Start/Stop Button Styles
export const StartStopButtonStyled = styled.button<StartStopButtonProps>`
  width: 82px;
  height: 82px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:focus {
    outline: none;
  }
`;

// Volume Control Styles
export const VolumeControlContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.metronome.background};
  ${transition({ properties: 'background-color' })}

  &:hover {
    background-color: ${({ theme }) => theme.colors.metronome.background};
  }
`;

export const VolumeSlider = styled.input`
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: ${({ theme }) => theme.colors.metronome.background};
  border-radius: 3px;
  outline: none;
  ${transition({ properties: 'background' })}

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    background: ${({ theme }) => theme.colors.metronome.accent};
    cursor: pointer;
    ${transition({ properties: ['background', 'transform'] })}
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 3px;
    background: ${({ theme }) => theme.colors.metronome.accent};
    cursor: pointer;
    ${transition({ properties: ['background', 'transform'] })}
  }

  &:hover {
    &::-webkit-slider-thumb {
      background: ${({ theme }) => theme.colors.metronome.accent};
      transform: scale(1.1);
    }

    &::-moz-range-thumb {
      background: ${({ theme }) => theme.colors.metronome.accent};
      transform: scale(1.1);
    }
  }

  &:focus {
    &::-webkit-slider-thumb {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.metronome.accent};
    }

    &::-moz-range-thumb {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.metronome.accent};
    }
  }
`;

export const VolumeIcon = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  ${transition({ properties: 'color' })}
`;

// Accent Control Styles
export const AccentControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  background-color: var(--color-neutral-800);
  border-radius: var(--radius-xs);
`;

export const AccentHeader = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const NoteList = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  flex-wrap: wrap;
`;

interface NoteButtonProps {
  accentLevel: number; // 0=Normal, 1=Accent, 2=Mute
}

export const NoteButton = styled.button<NoteButtonProps>`
  background: none;
  border: none;
  padding: 0;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, accentLevel }) => {
    switch (accentLevel) {
      case 1: // Accent
        return theme.colors.metronome.accent;
      case 2: // Mute
        return theme.colors.metronome.midBackground; // Dimmed/Grey
      default: // Normal (0)
        return theme.colors.metronome.primary;
    }
  }};
  opacity: ${({ accentLevel }) => (accentLevel === 2 ? 0.5 : 1)};
  transform: scale(${({ accentLevel }) => (accentLevel === 1 ? 1.1 : 1)});
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
    transform: scale(1.15);
  }

  &:focus {
    outline: none;
  }

  svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
    filter: ${({ accentLevel, theme }) =>
      accentLevel === 1 ? `drop-shadow(0 0 4px ${theme.colors.metronome.accent}80)` : 'none'};
  }
`;
