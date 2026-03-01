import React from 'react';

import UserAvatar from '../Auth/UserAvatar';

import {
  HeaderContainer,
  HeaderLeft,
  HeaderRight,
  Logo,
  MenuButton,
  MenuButtonWrapper,
  StreakBadge,
} from './styles';

interface HeaderProps {
  onOpenSidebar: () => void;
  onOpenLeftSidebar: () => void;
  streak: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, onOpenLeftSidebar, streak }) => {
  return (
    <HeaderContainer>
      <HeaderLeft>
        <MenuButtonWrapper>
          <MenuButton onClick={onOpenLeftSidebar} aria-label="Open menu">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect y="2" width="18" height="1.5" rx="0.75" fill="currentColor" />
              <rect y="8.25" width="18" height="1.5" rx="0.75" fill="currentColor" />
              <rect y="14.5" width="18" height="1.5" rx="0.75" fill="currentColor" />
            </svg>
          </MenuButton>
          {streak > 0 && <StreakBadge>{streak}🔥</StreakBadge>}
        </MenuButtonWrapper>
        <Logo src="/hitmaker-logo.svg" alt="Hitmaker" />
      </HeaderLeft>
      <HeaderRight>
        <UserAvatar onOpen={onOpenSidebar} />
      </HeaderRight>
    </HeaderContainer>
  );
};
