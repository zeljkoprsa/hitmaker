import styled from '@emotion/styled';

export const RunnerBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
  background: rgba(28, 28, 28, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 16px;
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0));
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const RunnerInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const RunnerName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RunnerMeta = styled.span`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RunnerTimer = styled.span<{ overtime: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ overtime, theme }) =>
    overtime ? theme.colors.metronome.accent : 'rgba(255,255,255,0.5)'};
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
`;

export const NextButton = styled.button`
  background: ${({ theme }) => theme.colors.metronome.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  padding: 0 16px;
  height: 44px;
  flex-shrink: 0;
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    opacity: 0.7;
    transform: scale(0.97);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      opacity: 1;
    }

    &:active {
      opacity: 0.7;
    }
  }
`;

export const EndButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  font-size: 18px;
  cursor: pointer;
  width: 36px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition: color 150ms ease;

  &:hover {
    color: rgba(255, 255, 255, 0.6);
  }
`;
