import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

import { flex, transition } from '../../shared/styles/mixins';

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

interface StatusContainerProps {
  status: 'offline' | 'saving' | 'synced';
}

export const StatusContainer = styled.div<StatusContainerProps>`
  ${flex({ direction: 'row', align: 'center', gap: 'xs' })}
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.metronome.buttonBackground};
  border-radius: ${({ theme }) => theme.borders.radius.xl};
  height: 36px;
  min-width: 80px;
  justify-content: center;
  ${transition({ properties: ['background-color', 'opacity'], speed: 'normal' })}

  /* Status-specific colors */
  ${({ status, theme }) => {
    switch (status) {
      case 'offline':
        return `
          border: ${theme.borders.width.thin} solid ${theme.colors.warning};
        `;
      case 'saving':
        return `
          border: ${theme.borders.width.thin} solid ${theme.colors.metronome.primary}40;
        `;
      case 'synced':
        return `
          border: ${theme.borders.width.thin} solid ${theme.colors.success}40;
        `;
    }
  }}
`;

export const StatusText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

export const Spinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid ${({ theme }) => theme.colors.metronome.primary}30;
  border-top-color: ${({ theme }) => theme.colors.metronome.primary};
  border-radius: ${({ theme }) => theme.borders.radius.round};
  animation: ${spin} 1s linear infinite;
`;
