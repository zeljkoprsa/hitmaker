import styled from '@emotion/styled';

import { flex } from '../../../../shared/styles/mixins';

// BeatVisualizer styles
export const BeatVisualizerContainer = styled.div`
  ${props =>
    flex({
      align: 'center',
      gap: 'xs',
    })(props)}
`;

export const Beat = styled.div<{ active: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 2px;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.metronome.accent : theme.colors.metronome.midBackground};
  transition: background-color ${({ theme }) => theme.transitions.duration.fast} ease;
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
