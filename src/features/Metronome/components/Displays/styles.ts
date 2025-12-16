import styled from '@emotion/styled';

import { flex } from '../../../../shared/styles/mixins';

// BeatVisualizer styles
export const BeatVisualizerContainer = styled.div`
  ${props =>
    flex({
      align: 'center',
      gap: 'xs',
    })(props)}
  width: 100%;
  height: 100%;
  padding: 0;
  box-sizing: border-box;
`;

export const Beat = styled.div<{ active: boolean; accentLevel?: number }>`
  flex: 1;
  height: 100%;
  cursor: pointer;
  background-color: ${({ theme, active, accentLevel = 0 }) => {
    // Mute = 2
    if (accentLevel === 2) {
      // Show very faint outline or transparent
      return active ? theme.colors.metronome.midBackground : 'transparent';
    }

    // Accent = 1
    if (accentLevel === 1) {
      return theme.colors.metronome.accent;
    }

    // Normal = 0
    // Active normal beat gets a color, inactive gets background
    return active ? theme.colors.text.primary : theme.colors.metronome.midBackground;
  }};

  opacity: ${({ active, accentLevel = 0 }) => {
    if (active) return 1;
    // Inactive states
    if (accentLevel === 2) return 0.1; // Ghosted mute
    if (accentLevel === 1) return 0.5; // Dimmed accent
    return 1; // Normal inactive (midBackground color handles the dimness look)
  }};

  border: ${({ theme, accentLevel = 0 }) =>
    accentLevel === 2 ? `1px dashed ${theme.colors.metronome.midBackground}` : 'none'};

  transition: all ${({ theme }) => theme.transitions.duration.fast} ease;
`;

// TimeSignatureDisplay styles
export const TimeSignatureContainer = styled.div`
  ${props =>
    flex({
      direction: 'column',
      align: 'center',
      gap: 'xs',
    })(props)}
  position: relative;
  padding: 0 ${({ theme }) => theme.spacing.md};

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: ${({ theme }) => theme.borders.width.thin};
    background-color: currentColor;
    transform: translateY(-50%);
  }
`;

export const TimeSignatureNumber = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  line-height: 1;
  background-color: inherit;
  z-index: 1;
  padding: ${({ theme }) => theme.spacing.xs};
`;

// TempoDisplay styles
export const TempoContainer = styled.div`
  ${props =>
    flex({
      direction: 'column',
      align: 'center',
      gap: 'sm',
    })(props)}
`;

export const TempoText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxxl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  line-height: 1;
`;

export const BpmText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
`;
