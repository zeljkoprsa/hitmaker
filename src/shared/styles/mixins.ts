import { css } from '@emotion/react';

import type { CustomTheme } from '../../styles/theme';

type TransitionProperty = 'all' | 'background-color' | 'color' | 'opacity' | 'transform' | string;
type TransitionSpeed = 'fast' | 'normal' | 'slow';

interface TransitionOptions {
  properties?: TransitionProperty | TransitionProperty[];
  speed?: TransitionSpeed;
  timing?: keyof CustomTheme['transitions']['timing'];
}

interface FlexOptions {
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: keyof CustomTheme['spacing'];
  wrap?: boolean;
}

export const flex = (options: FlexOptions = {}) => {
  const {
    direction = 'row',
    justify = 'flex-start',
    align = 'center',
    gap = 'sm',
    wrap = false,
  } = options;

  return (props: { theme: CustomTheme }) => {
    const { theme } = props;
    return css`
      display: flex;
      flex-direction: ${direction};
      justify-content: ${justify};
      align-items: ${align};
      gap: ${theme.spacing[gap]};
      ${wrap && 'flex-wrap: wrap;'}
    `;
  };
};

export const transition = (options: TransitionOptions = {}) => {
  const { properties = ['all'], speed = 'fast', timing = 'ease' } = options;

  return (props: { theme: CustomTheme }) => {
    const { theme } = props;
    const transitionProps = Array.isArray(properties) ? properties : [properties];
    return css`
      transition: ${transitionProps
        .map(
          prop => `${prop} ${theme.transitions.duration[speed]} ${theme.transitions.timing[timing]}`
        )
        .join(', ')};
    `;
  };
};

// Responsive breakpoint mixin
type Breakpoint =
  | 'smallMobile'
  | 'mobile'
  | 'largeMobile'
  | 'tablet'
  | 'desktop'
  | 'largeDesktop'
  | 'ultraWide';

interface ResponsiveOptions {
  breakpoint: Breakpoint;
  direction?: 'up' | 'down' | 'only';
}

export const responsive = (options: ResponsiveOptions) => {
  const { breakpoint, direction = 'up' } = options;

  return (props: { theme: CustomTheme }) => {
    const { theme } = props;
    const value = theme.breakpoints.values[breakpoint];

    if (direction === 'up') {
      return css`
        @media (min-width: ${value}px) {
          ${css``}
        }
      `;
    } else if (direction === 'down') {
      return css`
        @media (max-width: ${value - 1}px) {
          ${css``}
        }
      `;
    } else if (direction === 'only') {
      // Get next breakpoint
      const breakpoints: Breakpoint[] = [
        'smallMobile',
        'mobile',
        'largeMobile',
        'tablet',
        'desktop',
        'largeDesktop',
        'ultraWide',
      ];
      const currentIndex = breakpoints.indexOf(breakpoint);
      const nextBreakpoint = breakpoints[currentIndex + 1];

      if (nextBreakpoint) {
        const nextValue = theme.breakpoints.values[nextBreakpoint];
        return css`
          @media (min-width: ${value}px) and (max-width: ${nextValue - 1}px) {
            ${css``}
          }
        `;
      } else {
        return css`
          @media (min-width: ${value}px) {
            ${css``}
          }
        `;
      }
    }

    return css``;
  };
};

// Touch device mixin
export const touchOnly = () => css`
  @media (hover: none) and (pointer: coarse) {
    ${css``}
  }
`;

// Hover-capable device mixin
export const hoverCapable = () => css`
  @media (hover: hover) and (pointer: fine) {
    ${css``}
  }
`;

// Orientation mixins
export const portrait = () => css`
  @media (orientation: portrait) {
    ${css``}
  }
`;

export const landscape = () => css`
  @media (orientation: landscape) {
    ${css``}
  }
`;

// Safe area padding mixin
type SafeAreaSide = 'top' | 'bottom' | 'left' | 'right';

export const safeAreaPadding = (sides: SafeAreaSide[] = ['top', 'bottom', 'left', 'right']) => css`
  ${sides.includes('top') && 'padding-top: env(safe-area-inset-top, 0);'}
  ${sides.includes('bottom') && 'padding-bottom: env(safe-area-inset-bottom, 0);'}
    ${sides.includes('left') && 'padding-left: env(safe-area-inset-left, 0);'}
    ${sides.includes('right') && 'padding-right: env(safe-area-inset-right, 0);'}
`;

// Fluid sizing mixin
interface FluidSizeOptions {
  minSize: string;
  maxSize: string;
  minViewport?: string;
  maxViewport?: string;
}

export const fluidSize = (options: FluidSizeOptions) => {
  const { minSize, maxSize, minViewport = '320px', maxViewport = '1920px' } = options;

  return css`
    font-size: clamp(${minSize}, calc(${minSize} + (${maxSize} - ${minSize})), ${maxSize});

    @supports (font-size: clamp(1rem, 1vw, 2rem)) {
      font-size: clamp(${minSize}, ${minSize} + 2vw, ${maxSize});
    }
  `;
};
