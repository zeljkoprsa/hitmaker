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
