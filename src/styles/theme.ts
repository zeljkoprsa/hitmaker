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
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
  values: {
    mobile: number;
    tablet: number;
    desktop: number;
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

export interface CustomTheme {
  colors: Colors;
  spacing: Spacing;
  typography: Typography;
  borders: Borders;
  shadows: Shadows;
  transitions: Transitions;
  zIndices: ZIndices;
  breakpoints: Breakpoints;
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
    mobile: false,
    tablet: false,
    desktop: false,
    values: {
      mobile: 0,
      tablet: 640,
      desktop: 1024,
    },
  },
};
