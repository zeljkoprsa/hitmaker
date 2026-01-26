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

export const Logo = styled.img`
  height: 24px;
  width: auto;
`;

export const HeaderRight = styled.div`
  ${flex({ direction: 'row', align: 'center', gap: 'md' })}
`;
