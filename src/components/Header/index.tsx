import React from 'react';

import AuthButton from '../Auth/AuthButton';
import SyncStatus from '../SyncStatus';

import { HeaderContainer } from './styles';

export const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <SyncStatus />
      <AuthButton />
    </HeaderContainer>
  );
};
