import { useState, useEffect } from 'react';

import { theme } from '../styles/theme';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= theme.breakpoints.values.mobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= theme.breakpoints.values.mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    isTablet:
      window.innerWidth > theme.breakpoints.values.mobile &&
      window.innerWidth <= theme.breakpoints.values.tablet,
    isDesktop: window.innerWidth > theme.breakpoints.values.tablet,
  };
};
