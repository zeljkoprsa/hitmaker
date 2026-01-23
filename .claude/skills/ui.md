---
name: ui
description: UI styling with Emotion, Framer Motion, and CSS Variables. Use when building components, styling, animations, or handling design system tokens
argument-hint: "[component-name]"
---

# UI Development Skill

**Quick Reference:** Custom design system using Emotion (CSS-in-JS), Framer Motion, and CSS Variables

**Invoke when:** Working on UI components, styling, animations, or visual elements

---

## Overview

This codebase uses a hybrid styling approach:

- **Emotion** - Primary styling solution (CSS-in-JS)
- **Framer Motion** - Animations and transitions
- **CSS Modules** - Auth/layout components only
- **CSS Variables** - Global design tokens
- **Theme System** - Centralized in `src/styles/theme.ts`

**Key Colors:**
- Accent: `#F64105` (orange-red)
- Primary Text: `#DDDDDD` (light grey)
- Background: `#1C1C1C` (dark)
- Mid Background: `#2D2D2D`

---

## Styling Decision Tree

### When to use Emotion styled components (DEFAULT)
✅ Feature components (Metronome, Controls, etc.)
✅ Reusable UI components
✅ Components needing theme access
✅ Components with dynamic styling based on props

### When to use CSS Modules
✅ Auth components (`AuthModal`, etc.)
✅ Layout components with complex nesting
✅ Components using many CSS variables

### When to use inline styles
✅ Dynamic values calculated at runtime only
✅ One-off overrides (avoid if possible)

---

## Component Creation Pattern

### 1. Create Component File

**File:** `src/features/MyFeature/components/MyComponent.tsx`

```typescript
import React from 'react';
import { ComponentContainer, Title } from './styles';

interface MyComponentProps {
  title: string;
  isActive?: boolean;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, isActive = false }) => {
  return (
    <ComponentContainer isActive={isActive}>
      <Title>{title}</Title>
    </ComponentContainer>
  );
};
```

### 2. Create Styles File

**File:** `src/features/MyFeature/components/styles.ts`

```typescript
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { transition, flex } from '../../../shared/styles/mixins';

// Define prop interfaces for typed styled components
interface ComponentContainerProps {
  isActive: boolean;
}

export const ComponentContainer = styled.div<ComponentContainerProps>`
  ${flex({ direction: 'column', align: 'center', gap: 'md' })}
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  ${transition({ properties: ['background-color', 'transform'], speed: 'normal' })}

  /* Conditional styling based on props */
  ${({ isActive, theme }) => isActive && `
    background-color: ${theme.colors.metronome.midBackground};
    border: ${theme.borders.width.thin} solid ${theme.colors.metronome.accent};
  `}

  &:hover {
    background-color: ${({ theme }) => theme.colors.metronome.midBackground};
  }
`;

export const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

// For animated components, use motion components
export const AnimatedButton = styled(motion.button)`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.metronome.buttonBackground};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: ${({ theme }) => theme.colors.metronome.primary};
  cursor: pointer;
  ${transition({ properties: 'color', speed: 'fast' })}

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;
```

### 3. File Organization

```
src/features/MyFeature/
├── components/
│   ├── MyComponent.tsx       # Component logic
│   ├── styles.ts              # Styled components
│   └── SubComponent/
│       ├── index.tsx
│       └── styles.ts
└── index.ts
```

---

## Theme Access

### Accessing Theme in Styled Components

```typescript
import styled from '@emotion/styled';

// Theme is automatically available via props
export const Container = styled.div`
  /* Colors */
  color: ${({ theme }) => theme.colors.text.primary};
  background-color: ${({ theme }) => theme.colors.metronome.background};

  /* Spacing */
  padding: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.sm};

  /* Typography */
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  line-height: ${({ theme }) => theme.typography.lineHeights.base};

  /* Borders */
  border-radius: ${({ theme }) => theme.borders.radius.md};
  border: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.metronome.primary};

  /* Shadows */
  box-shadow: ${({ theme }) => theme.shadows.md};

  /* Z-Index */
  z-index: ${({ theme }) => theme.zIndices.modal};
`;
```

### Theme Tokens Reference

**Spacing Scale:**
```typescript
xs: '2px'    // Smallest gap
sm: '4px'    // Small spacing
md: '8px'    // Medium (default)
lg: '16px'   // Large
xl: '24px'   // Extra large
xxl: '32px'  // Double XL
xxxl: '48px' // Triple XL
```

**Font Sizes:**
```typescript
xs: '12px'
sm: '14px'
md: '16px'   // Base
lg: '18px'
xl: '20px'
xxl: '24px'
xxxl: '32px'
```

**Font Weights:**
```typescript
light: 300
regular: 400      // Default
medium: 500
semibold: 600
bold: 700
```

**Border Radius:**
```typescript
sm: '4px'
md: '8px'
lg: '12px'
xl: '16px'
round: '50%'      // Perfect circle
```

**Transition Durations:**
```typescript
fast: '150ms'     // Quick interactions
normal: '300ms'   // Default
slow: '500ms'     // Dramatic effects
```

**Z-Index Layers:**
```typescript
hide: -1
base: 0
dropdown: 1000
sticky: 1100
overlay: 1200
modal: 1300
popover: 1400
tooltip: 1500
```

---

## Using Mixins

### Flex Mixin

```typescript
import { flex } from '../../shared/styles/mixins';

export const Container = styled.div`
  ${flex()}  // Default: row, flex-start, center, gap: sm
`;

export const Column = styled.div`
  ${flex({
    direction: 'column',
    justify: 'space-between',
    align: 'stretch',
    gap: 'lg',
    wrap: true
  })}
`;
```

**Options:**
- `direction`: 'row' | 'column' (default: 'row')
- `justify`: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' (default: 'flex-start')
- `align`: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline' (default: 'center')
- `gap`: Theme spacing key (default: 'sm')
- `wrap`: boolean (default: false)

### Transition Mixin

```typescript
import { transition } from '../../shared/styles/mixins';

export const Button = styled.button`
  ${transition()}  // Default: all properties, fast, ease
`;

export const Card = styled.div`
  ${transition({
    properties: ['background-color', 'transform'],
    speed: 'normal',
    timing: 'easeInOut'
  })}
`;
```

**Options:**
- `properties`: Single property or array (default: ['all'])
- `speed`: 'fast' | 'normal' | 'slow' (default: 'fast')
- `timing`: 'ease' | 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' (default: 'ease')

---

## Animation Patterns

### Using AnimationWrapper

Always wrap animated components with `AnimationWrapper` for performance optimization via LazyMotion:

```typescript
import { AnimationWrapper } from '../AnimationWrapper';
import { motion } from 'framer-motion';

export const MyComponent = () => {
  return (
    <AnimationWrapper mode="wait" initial={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        Content here
      </motion.div>
    </AnimationWrapper>
  );
};
```

**AnimationWrapper Props:**
- `mode`: 'sync' | 'wait' | 'popLayout' (default: 'sync')
- `initial`: boolean (default: false)

### Styled Motion Components

```typescript
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

// Create a motion component first, then style it
export const AnimatedCard = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.metronome.background};
  border-radius: ${({ theme }) => theme.borders.radius.md};
`;

// Usage in component
<AnimatedCard
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  whileHover={{ scale: 1.05 }}
  transition={{ duration: 0.2 }}
>
  Content
</AnimatedCard>
```

### Common Animation Variants

```typescript
// Fade in/out
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// Slide up/down
const slideVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

// Scale
const scaleVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
};

// Usage
<motion.div
  variants={fadeVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Performance Considerations

✅ **Do:**
- Use `LazyMotion` with `domAnimation` for smaller bundle size
- Use `will-change: transform` for smooth animations
- Prefer `transform` and `opacity` for animations (GPU accelerated)
- Use `layout` prop for layout animations

❌ **Don't:**
- Animate `width`, `height`, or `top/left/right/bottom` directly
- Use complex animations on many elements simultaneously
- Forget to memoize animation variants

---

## TypeScript Patterns

### Typing Styled Component Props

```typescript
// Define props interface
interface ButtonProps {
  variant: 'primary' | 'secondary';
  size: 'small' | 'medium' | 'large';
  isActive?: boolean;
}

// Use interface in styled component
export const Button = styled.button<ButtonProps>`
  padding: ${({ size, theme }) => {
    switch (size) {
      case 'small': return theme.spacing.sm;
      case 'large': return theme.spacing.lg;
      default: return theme.spacing.md;
    }
  }};

  background-color: ${({ variant, theme }) =>
    variant === 'primary'
      ? theme.colors.metronome.accent
      : theme.colors.metronome.background
  };

  ${({ isActive, theme }) => isActive && `
    border: ${theme.borders.width.medium} solid ${theme.colors.metronome.accent};
  `}
`;
```

### Extending Theme Types

The theme is already typed via `src/shared/types/emotion.d.ts`:

```typescript
import '@emotion/react';
import { theme } from '../../styles/theme';

type ThemeType = typeof theme;

declare module '@emotion/react' {
  export interface Theme extends ThemeType {
    spacing: Spacing;
  }
}
```

### Typing Motion Components

```typescript
import { motion, HTMLMotionProps } from 'framer-motion';
import styled from '@emotion/styled';

// For custom motion component props
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  isSelected: boolean;
}

export const AnimatedCard = styled(motion.div)<AnimatedCardProps>`
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.metronome.accent : theme.colors.metronome.background
  };
`;
```

---

## CSS Modules Pattern (Auth/Layout Only)

When working with Auth components, use CSS Modules:

**File:** `Component.module.css`

```css
.container {
  padding: var(--spacing-lg);
  background-color: var(--color-background-base);
  border-radius: var(--radius-lg);
}

.button {
  background-color: var(--color-accent);
  color: var(--color-text-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  transition: opacity 0.2s;
}

.button:hover {
  opacity: 0.9;
}
```

**Component:**

```typescript
import styles from './Component.module.css';

export const Component = () => {
  return (
    <div className={styles.container}>
      <button className={styles.button}>Click me</button>
    </div>
  );
};
```

---

## Common Tasks

### Add a new styled button

```typescript
import styled from '@emotion/styled';
import { transition } from '../../shared/styles/mixins';

export const PrimaryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.metronome.accent};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  ${transition({ properties: ['opacity', 'transform'], speed: 'fast' })}

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

### Create an animated dropdown

```typescript
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

export const Dropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.sm};
  z-index: ${({ theme }) => theme.zIndices.dropdown};
`;

// Usage
<Dropdown
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2 }}
>
  <DropdownItem>Option 1</DropdownItem>
  <DropdownItem>Option 2</DropdownItem>
</Dropdown>
```

### Create a custom input field

```typescript
export const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.metronome.primary};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  ${transition({ properties: ['border-color', 'box-shadow'] })}

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.metronome.accent}40;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

### Add a card component

```typescript
export const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  ${transition({ properties: ['box-shadow', 'transform'], speed: 'normal' })}

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    transform: translateY(-2px);
  }
`;
```

---

## Gotchas & Best Practices

### ✅ DO:

1. **Always access theme properties** - Never hardcode colors, spacing, etc.
   ```typescript
   // ✅ Good
   color: ${({ theme }) => theme.colors.metronome.accent};

   // ❌ Bad
   color: #F64105;
   ```

2. **Use mixins for repetitive patterns** - Keep styles DRY
   ```typescript
   // ✅ Good
   ${flex({ direction: 'column', gap: 'lg' })}
   ${transition()}

   // ❌ Bad
   display: flex;
   flex-direction: column;
   gap: 16px;
   transition: all 0.15s ease;
   ```

3. **Type your styled component props** - Prevent runtime errors
   ```typescript
   // ✅ Good
   interface ButtonProps { variant: 'primary' | 'secondary' }
   export const Button = styled.button<ButtonProps>`...`

   // ❌ Bad
   export const Button = styled.button`...`
   ```

4. **Use CSS variables in CSS Modules** - For consistency
   ```css
   /* ✅ Good */
   color: var(--color-accent);

   /* ❌ Bad */
   color: #F64105;
   ```

5. **Organize styled components in `styles.ts`** - Keep component files clean
   ```
   ✅ Component.tsx (logic)
   ✅ styles.ts (styled components)

   ❌ Component.tsx (logic + 200 lines of styles)
   ```

6. **Wrap animations in AnimationWrapper** - Use LazyMotion for performance

7. **Use template literals for conditional styles** - More readable
   ```typescript
   ${({ isActive, theme }) => isActive && `
     color: ${theme.colors.metronome.accent};
     transform: scale(1.1);
   `}
   ```

### ❌ DON'T:

1. **Don't hardcode values** - Always use theme tokens

2. **Don't create Emotion components in Auth/Layout** - Use CSS Modules there

3. **Don't animate expensive properties** - Stick to `transform` and `opacity`

4. **Don't forget TypeScript interfaces** - Especially for prop-based styling

5. **Don't use inline styles unless dynamic** - Prefer styled components

6. **Don't mix styling approaches in the same component** - Choose one pattern

7. **Don't create global styles** - Use CSS variables if needed globally

---

## Quick Reference Examples

### Button Variations

```typescript
// Primary action button
export const PrimaryButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background-color: ${({ theme }) => theme.colors.metronome.accent};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  cursor: pointer;
  ${transition()}

  &:hover { opacity: 0.9; }
  &:active { transform: scale(0.98); }
`;

// Ghost button
export const GhostButton = styled.button`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: none;
  border: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => theme.colors.metronome.primary};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: ${({ theme }) => theme.colors.metronome.primary};
  cursor: pointer;
  ${transition({ properties: ['border-color', 'color'] })}

  &:hover {
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

// Icon button
export const IconButton = styled.button`
  width: ${({ theme }) => theme.spacing.xxl};
  height: ${({ theme }) => theme.spacing.xxl};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.metronome.primary};
  cursor: pointer;
  ${transition({ properties: 'color' })}

  &:hover {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;
```

### Layout Components

```typescript
// Centered container
export const CenteredContainer = styled.div`
  ${flex({ direction: 'column', justify: 'center', align: 'center' })}
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xl};
`;

// Grid layout
export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

// Stack (vertical layout)
export const Stack = styled.div`
  ${flex({ direction: 'column', gap: 'md' })}
`;

// Inline (horizontal layout)
export const Inline = styled.div`
  ${flex({ direction: 'row', gap: 'sm', wrap: true })}
`;
```

---

## File References

**Core Files:**
- Theme: `src/styles/theme.ts`
- Mixins: `src/shared/styles/mixins.ts`
- Theme Types: `src/shared/types/emotion.d.ts`

**Example Files:**
- Styled Components: `src/features/Metronome/components/Controls/styles.ts`
- Animation Wrapper: `src/features/Metronome/components/AnimationWrapper.tsx`
- CSS Module: `src/components/Auth/AuthModal.module.css`

---

## Summary

This UI system prioritizes:
1. **Consistency** - Theme tokens ensure visual harmony
2. **Performance** - LazyMotion, GPU-accelerated animations
3. **Type Safety** - Full TypeScript support
4. **Maintainability** - Clear patterns, organized files
5. **Developer Experience** - Helpful mixins, clear documentation

**Default workflow:**
1. Create component in `Component.tsx`
2. Create styles in `styles.ts` using Emotion
3. Use theme tokens for all values
4. Add animations with Framer Motion
5. Type all props and styled components
