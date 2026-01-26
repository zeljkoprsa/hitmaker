import React from 'react';

import AuthButton from '../Auth/AuthButton';
import SyncStatus from '../SyncStatus';

import { HeaderContainer, Logo, HeaderRight } from './styles';

export const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Logo src="/hitmaker-logo.svg" alt="Hitmaker" />
      <HeaderRight>
        <SyncStatus />
        <AuthButton />
      </HeaderRight>
    </HeaderContainer>
  );
};
