import { useState, useEffect, useCallback } from 'react';

import { theme } from '../styles/theme';

interface ResponsiveState {
  // Viewport dimensions
  width: number;
  height: number;

  // Device breakpoints
  isSmallMobile: boolean;
  isMobile: boolean;
  isLargeMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isUltraWide: boolean;

  // Device capabilities
  isTouchDevice: boolean;
  isHoverCapable: boolean;

  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;

  // Convenience helpers
  isMobileDevice: boolean; // Any mobile size
  isTabletOrLarger: boolean;
  isDesktopOrLarger: boolean;
}

const getMediaQueryMatch = (query: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query.replace('@media ', '')).matches;
};

const calculateResponsiveState = (): ResponsiveState => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const bp = theme.breakpoints.values;

  // Breakpoint checks
  const isSmallMobile = width < bp.mobile;
  const isMobile = width >= bp.mobile && width < bp.largeMobile;
  const isLargeMobile = width >= bp.largeMobile && width < bp.tablet;
  const isTablet = width >= bp.tablet && width < bp.desktop;
  const isDesktop = width >= bp.desktop && width < bp.largeDesktop;
  const isLargeDesktop = width >= bp.largeDesktop && width < bp.ultraWide;
  const isUltraWide = width >= bp.ultraWide;

  // Device capability detection
  const isTouchDevice =
    getMediaQueryMatch('(hover: none) and (pointer: coarse)') ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;
  const isHoverCapable = getMediaQueryMatch('(hover: hover) and (pointer: fine)');

  // Orientation
  const isPortrait = getMediaQueryMatch('(orientation: portrait)');
  const isLandscape = getMediaQueryMatch('(orientation: landscape)');

  // Convenience helpers
  const isMobileDevice = isSmallMobile || isMobile || isLargeMobile;
  const isTabletOrLarger = isTablet || isDesktop || isLargeDesktop || isUltraWide;
  const isDesktopOrLarger = isDesktop || isLargeDesktop || isUltraWide;

  return {
    width,
    height,
    isSmallMobile,
    isMobile,
    isLargeMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isUltraWide,
    isTouchDevice,
    isHoverCapable,
    isPortrait,
    isLandscape,
    isMobileDevice,
    isTabletOrLarger,
    isDesktopOrLarger,
  };
};

export const useResponsive = () => {
  const [state, setState] = useState<ResponsiveState>(calculateResponsiveState);

  const handleResize = useCallback(() => {
    setState(calculateResponsiveState());
  }, []);

  useEffect(() => {
    // Debounce resize events for better performance
    let timeoutId: NodeJS.Timeout;

    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', handleResize);

    // Listen to media query changes for touch/hover capabilities
    const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)');

    const handleMediaChange = () => handleResize();

    touchQuery.addEventListener('change', handleMediaChange);
    hoverQuery.addEventListener('change', handleMediaChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
      touchQuery.removeEventListener('change', handleMediaChange);
      hoverQuery.removeEventListener('change', handleMediaChange);
    };
  }, [handleResize]);

  return state;
};
