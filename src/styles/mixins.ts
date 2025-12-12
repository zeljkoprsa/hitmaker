import { css } from '@emotion/react';

import { CustomTheme } from './theme';

type TransitionProperty = 'all' | 'background-color' | 'color' | 'opacity' | 'transform' | string;
type TransitionSpeed = 'fast' | 'normal' | 'slow';

interface TransitionOptions {
  properties?: TransitionProperty | TransitionProperty[];
  speed?: TransitionSpeed;
  timing?: keyof CustomTheme['transitions']['timing'];
}

type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
type JustifyContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
type AlignItems = 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
type Gap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';

interface FlexOptions {
  direction?: FlexDirection;
  justify?: JustifyContent;
  align?: AlignItems;
  gap?: Gap;
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

  return (theme: CustomTheme) => css`
    display: flex;
    flex-direction: ${direction};
    justify-content: ${justify};
    align-items: ${align};
    gap: ${theme.spacing[gap]};
    ${wrap && 'flex-wrap: wrap;'}
  `;
};

interface GridOptions {
  columns?: number;
  gap?: Gap;
  minWidth?: string;
  autoFit?: boolean;
}

export const grid = (options: GridOptions = {}) => {
  const { columns = 1, gap = 'sm', minWidth = '250px', autoFit = false } = options;

  return (theme: CustomTheme) => css`
    display: grid;
    grid-template-columns: ${autoFit
      ? `repeat(auto-fit, minmax(${minWidth}, 1fr))`
      : `repeat(${columns}, 1fr)`};
    gap: ${theme.spacing[gap]};
  `;
};

export const transition = (options: TransitionOptions = {}) => {
  const { properties = ['all'], speed = 'fast', timing = 'ease' } = options;

  return (theme: CustomTheme) => {
    const props = Array.isArray(properties) ? properties : [properties];
    return css`
      transition: ${props
        .map(
          prop => `${prop} ${theme.transitions.duration[speed]} ${theme.transitions.timing[timing]}`
        )
        .join(', ')};
    `;
  };
};
