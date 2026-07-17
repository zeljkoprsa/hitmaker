import React from 'react';

import { HeaderContainer, HeaderLeft, Logo } from './styles';

// Slim brand bar atop the metronome view. Navigation lives in the persistent
// AppNav (JAK-50), so there's no menu button here anymore; and no streak
// badge — the journal (spec #6) is a training log, not a game.
export const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <HeaderLeft>
        <Logo src="/hitmaker-logo.svg" alt="Hitmaker" />
      </HeaderLeft>
    </HeaderContainer>
  );
};
