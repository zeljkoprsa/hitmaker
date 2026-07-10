import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const Stage = styled.div<{ dimmed?: boolean }>`
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 16px 20px 120px; /* bottom clearance for the fixed runner bar */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: ${({ dimmed }) => (dimmed ? 0.45 : 1)};
  transition: opacity 200ms ease;
`;

export const BlockCard = styled.div`
  width: 100%;
  animation: ${fadeUp} 0.4s ease;
`;

export const RunProgress = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 28px;
`;

export const Eyebrow = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.metronome.accent};
  text-transform: uppercase;
  margin-bottom: 10px;
`;

export const BlockTitle = styled.h1`
  font-family: 'Bebas Neue', Impact, 'Arial Narrow', sans-serif;
  font-size: clamp(40px, 10vw, 60px);
  line-height: 0.95;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.metronome.primary};
  margin: 0 0 20px;
`;

export const Countdown = styled.div<{ resting?: boolean }>`
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: clamp(56px, 16vw, 96px);
  font-weight: 300;
  line-height: 1;
  color: ${({ resting, theme }) =>
    resting ? theme.colors.metronome.accent : theme.colors.metronome.primary};
  font-variant-numeric: tabular-nums;
  margin: 8px 0 20px;
`;

export const TempoChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ theme }) => theme.colors.metronome.accent};
  background: rgba(246, 65, 5, 0.1);
  border: 1px solid rgba(246, 65, 5, 0.25);
  padding: 6px 14px;
  border-radius: 999px;
  letter-spacing: 0.05em;
  margin-bottom: 24px;
`;

export const SilentChip = styled(TempoChip)`
  color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.12);
`;

export const ItemList = styled.div`
  width: 100%;
  max-width: 440px;
  margin: 0 auto 20px;
  background: ${({ theme }) => theme.colors.metronome.background};
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 14px 18px;
  text-align: left;
`;

export const ItemRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`;

export const ItemDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.metronome.accent};
  margin-top: 7px;
  flex-shrink: 0;
`;

export const ItemText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.metronome.primary};

  em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.4);
    font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  }
`;

export const Prose = styled.div`
  font-family: 'Bebas Neue', Impact, 'Arial Narrow', sans-serif;
  font-size: clamp(22px, 6vw, 32px);
  color: ${({ theme }) => theme.colors.metronome.accent};
  letter-spacing: 0.05em;
  margin: 4px 0 24px;
`;

export const NextUp = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 24px;

  strong {
    color: rgba(255, 255, 255, 0.75);
    font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  }
`;

export const ReadyButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.metronome.accent};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  cursor: pointer;
  padding: 14px 32px;
  min-height: 52px;
  transition:
    opacity 150ms ease,
    transform 150ms ease;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const PausedBadge = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  padding: 4px 12px;
  margin-bottom: 16px;
`;
