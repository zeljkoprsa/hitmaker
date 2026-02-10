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
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  position: relative;

  /* Height is fixed to container, inner element varies */
  height: 100%;

  /* Inner bar that changes height based on accent level */
  &::before {
    content: '';
    width: 100%;
    background-color: ${({ theme, active }) =>
      active ? theme.colors.metronome.accent : theme.colors.metronome.midBackground};
    border-radius: ${({ theme }) => theme.borders.radius.sm}
      ${({ theme }) => theme.borders.radius.sm} 0 0;
    transition: all ${({ theme }) => theme.transitions.duration.fast} ease;

    /* Height based on accent level */
    height: ${({ accentLevel = 0 }) => {
      if (accentLevel === 2) return '20%'; // Mute - shortest
      if (accentLevel === 1) return '100%'; // Accent - tallest
      return '60%'; // Normal - medium
    }};

    /* Active beat gets brighter and slightly larger */
    ${({ active }) =>
      active &&
      `
      transform: scaleY(1.05);
      filter: brightness(1.2);
      box-shadow: 0 0 8px rgba(246, 65, 5, 0.4);
    `}

    /* Muted beats get dashed border */
    ${({ theme, accentLevel = 0 }) =>
      accentLevel === 2 &&
      `
      border: 1px dashed ${theme.colors.metronome.midBackground};
      background-color: transparent;
    `}
  }

  /* Hover effect */
  &:hover::before {
    filter: brightness(1.1);
  }
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
