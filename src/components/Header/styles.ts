import styled from '@emotion/styled';

import { flex } from '../../shared/styles/mixins';

export const HeaderContainer = styled.header`
  ${flex({ direction: 'row', align: 'center', gap: 'md' })}
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  z-index: ${({ theme }) => theme.zIndices.sticky};
`;
