import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

interface StatusDotProps {
  status: 'offline' | 'saving' | 'synced';
}

export const StatusDot = styled.div<StatusDotProps>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.borders.radius.round};

  ${({ status, theme }) => {
    switch (status) {
      case 'offline':
        return `
          background-color: ${theme.colors.warning};
        `;
      case 'saving':
        return `
          background-color: ${theme.colors.metronome.accent};
          animation: ${pulse} 1s ease-in-out infinite;
        `;
      case 'synced':
        return `
          background-color: ${theme.colors.success};
        `;
    }
  }}
`;
