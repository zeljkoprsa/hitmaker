import '@emotion/react';
import { theme } from '../../styles/theme';

interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
  xxxl: string;
}

type ThemeType = typeof theme;

declare module '@emotion/react' {
  export interface Theme extends ThemeType {
    spacing: Spacing;
  }
}
