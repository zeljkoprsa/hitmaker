import styled from '@emotion/styled';

import { flex } from '../../shared/styles/mixins';

export const HeaderContainer = styled.header`
  ${flex({ direction: 'row', align: 'center', justify: 'space-between' })}
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  left: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndices.sticky};
`;

export const HeaderLeft = styled.div`
  ${flex({ direction: 'row', align: 'center', gap: 'md' })}
`;

export const HeaderRight = styled.div`
  ${flex({ direction: 'row', align: 'center', gap: 'md' })}
`;

export const Logo = styled.img`
  height: 24px;
  width: auto;
`;

export const MenuButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition: color 150ms ease;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.primary};
  }

  &:active {
    color: ${({ theme }) => theme.colors.metronome.primary};
    opacity: 0.7;
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      color: rgba(255, 255, 255, 0.5);
    }

    &:active {
      color: ${({ theme }) => theme.colors.metronome.primary};
    }
  }
`;
