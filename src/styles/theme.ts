// Theme type definitions
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface Colors {
  metronome: {
    primary: string; // Text color
    accent: string; // Accent elements
    background: string; // Background sections
    midBackground: string; // Mid-tone background
    darkBackground: string; // Darker background for body and main content
    buttonBackground: string; // Button background color
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
}

interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  xxxl: string;
}

interface Typography {
  fontFamily: {
    base: string;
    mono: string;
  };
  fontSizes: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };
  fontWeights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    base: number;
    relaxed: number;
  };
}

interface Breakpoints {
  // Device type flags (computed at runtime)
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;

  // Raw breakpoint values (in pixels)
  values: {
    smallMobile: number;
    mobile: number;
    largeMobile: number;
    tablet: number;
    desktop: number;
    largeDesktop: number;
    ultraWide: number;
  };

  // Media query strings for CSS-in-JS
  mediaQueries: {
    smallMobile: string;
    mobile: string;
    largeMobile: string;
    tablet: string;
    desktop: string;
    largeDesktop: string;
    ultraWide: string;
    touch: string;
    hover: string;
    portrait: string;
    landscape: string;
  };
}

interface Borders {
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    round: string;
  };
  width: {
    thin: string;
    medium: string;
    thick: string;
  };
}

interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

interface Transitions {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  timing: {
    ease: string;
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

interface ZIndices {
  hide: number;
  base: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  popover: number;
  tooltip: number;
}

interface FluidTypography {
  clamp: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };
}

interface FluidSpacing {
  clamp: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    xxxl: string;
  };
}

export interface CustomTheme {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  borders: Borders;
  shadows: Shadows;
  transitions: Transitions;
  zIndices: ZIndices;
  breakpoints: Breakpoints;
  fluidTypography: FluidTypography;
  fluidSpacing: FluidSpacing;
}

// Theme implementation
export const theme: CustomTheme = {
  colors: {
    metronome: {
      primary: '#DDDDDD', // Text color
      accent: '#F64105', // Accent elements
      background: '#242424', // Background sections
      midBackground: '#2D2D2D', // Mid-tone background
      darkBackground: '#1C1C1C', // Darker background for body and main content
      buttonBackground: '#313131', // Button background color
    },
    success: '#52C41A',
    warning: '#FAAD14',
    error: '#FF4D4F',
    info: '#1890FF',
    text: {
      primary: '#DDDDDD', // Using metronome-primary for all text
      secondary: '#DDDDDD', // Using metronome-primary for consistency
      disabled: '#DDDDDD', // Using metronome-primary for consistency
      inverse: '#242424', // Using metronome-background for inverse
    },
  },
  spacing: {
    xs: '2px', // Smallest gap for tight spacing
    sm: '4px', // Small spacing
    md: '8px', // Medium spacing
    lg: '16px', // Large spacing
    xl: '24px', // Extra large spacing
    xxl: '32px', // Double extra large spacing
    xxxl: '48px', // Triple extra large spacing
  },
  typography: {
    fontFamily: {
      base: 'Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Geist Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px',
    },
    fontWeights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      base: 1.5,
      relaxed: 1.75,
    },
  },
  borders: {
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      round: '50%',
    },
    width: {
      thin: '1px',
      medium: '2px',
      thick: '4px',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    timing: {
      ease: 'ease',
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  zIndices: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
  breakpoints: {
    // These will be set at runtime by useResponsive
    mobile: false,
    tablet: false,
    desktop: false,

    values: {
      smallMobile: 320,
      mobile: 375,
      largeMobile: 428,
      tablet: 768,
      desktop: 1024,
      largeDesktop: 1440,
      ultraWide: 1920,
    },

    mediaQueries: {
      smallMobile: '@media (min-width: 320px)',
      mobile: '@media (min-width: 375px)',
      largeMobile: '@media (min-width: 428px)',
      tablet: '@media (min-width: 768px)',
      desktop: '@media (min-width: 1024px)',
      largeDesktop: '@media (min-width: 1440px)',
      ultraWide: '@media (min-width: 1920px)',
      touch: '@media (hover: none) and (pointer: coarse)',
      hover: '@media (hover: hover) and (pointer: fine)',
      portrait: '@media (orientation: portrait)',
      landscape: '@media (orientation: landscape)',
    },
  },

  fluidTypography: {
    clamp: {
      xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
      sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
      md: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
      lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
      xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
      xxl: 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
      xxxl: 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
    },
  },

  fluidSpacing: {
    clamp: {
      xs: 'clamp(0.125rem, 0.1rem + 0.125vw, 0.25rem)',
      sm: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
      md: 'clamp(0.5rem, 0.4rem + 0.5vw, 1rem)',
      lg: 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',
      xl: 'clamp(1.5rem, 1.2rem + 1.5vw, 2rem)',
      xxl: 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
      xxxl: 'clamp(3rem, 2rem + 5vw, 4rem)',
    },
  },
};
