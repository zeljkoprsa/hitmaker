import React from 'react';

import { HeaderContainer, HeaderLeft, Logo, MenuButton, MenuButtonWrapper } from './styles';

interface HeaderProps {
  onOpenLeftSidebar: () => void;
}

// No streak badge — the practice journal (spec #6) is a training log, not a
// game; a gap is information, not a failure state.
export const Header: React.FC<HeaderProps> = ({ onOpenLeftSidebar }) => {
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
        </MenuButtonWrapper>
        <Logo src="/hitmaker-logo.svg" alt="Hitmaker" />
      </HeaderLeft>
    </HeaderContainer>
  );
};
