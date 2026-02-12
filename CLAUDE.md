# Hitmaker - Project Guide for Claude

## Project Overview
Hitmaker is a professional metronome web app built with React, TypeScript, and Emotion/styled-components. Focus: minimal UI, responsive design, and excellent mobile/touch experience.

## Design System

### Grid System
- **Base module**: 82px × 82px (desktop), 76px (tablet), 70px (mobile)
- All control elements align to this grid: time signature, subdivision, tempo display, tempo slider, sound selector
- Gaps: Minimal 2px between grid elements
- Playback controls (start/stop, tap tempo): Intentionally larger at ~120px for prominence

### Responsive Breakpoints
```typescript
smallMobile: 320px   // iPhone SE
mobile: 375px        // iPhone 12/13/14
largeMobile: 428px   // iPhone 14 Pro Max
tablet: 768px        // iPad portrait
desktop: 1024px      // iPad landscape / small desktop
largeDesktop: 1440px // Large desktop
ultraWide: 1920px    // Ultra-wide monitors
```

### Layout Strategy
- **Mobile/Tablet (≤768px)**: Edge-to-edge, full viewport width
- **Desktop (≥1024px)**: Constrained to 800px max-width with padding

### Touch Optimization
- **Minimum touch targets**: 44px (iOS guideline)
- **Touch-specific media queries**: `@media (hover: none) and (pointer: coarse)`
  - Disable hover transforms on touch devices
  - Add active state feedback with `transform: scale(0.98)`
- **Slider thumbs**: Enlarged to 20px on touch devices

### Color System
- **Background**: #242424 (`var(--color-neutral-800)`, `theme.colors.metronome.background`)
- **Accent**: #F64105 (`theme.colors.metronome.accent`)
- **Text Primary**: White/light (`theme.colors.metronome.primary`)
- **Borders**: Use background color for invisible borders, accent for active states

### Component Patterns

#### Responsive Menus (Time Signature, Subdivision)
- Use CSS Grid, not flexbox
- Mobile: 2-3 column grid with horizontal scroll if needed
- Position below button on mobile, to sides on desktop
- Semi-transparent backdrop: `rgba(0, 0, 0, 0.6)` with `backdrop-filter: blur(8px)`

#### Buttons
- Borderless by default
- Active/hover states: Accent color text, no borders
- Minimal visual noise - only show state through color/animation
- Generous padding for comfortable tap targets

#### Viewport Handling
- Use `100dvh` (dynamic viewport height) for mobile browser chrome
- Polyfill for older browsers in `src/utils/viewportHeight.ts`
- Safe area insets: `env(safe-area-inset-*)` for notched devices

## File Organization
```
src/
├── features/Metronome/
│   ├── components/
│   │   ├── Controls/       # Time sig, subdivision, tempo controls
│   │   │   └── styles.ts   # Emotion styled-components
│   │   └── Displays/       # Beat visualizer, displays
│   ├── context/            # MetronomeProvider
│   └── styles.module.css   # Layout and responsive styles
├── core/
│   ├── engine/             # Core metronome engine
│   ├── types/              # TypeScript types
│   └── utils/              # Time signature utilities
├── shared/styles/
│   └── mixins.ts           # Responsive mixins (touchOnly, hoverCapable, etc.)
├── styles/
│   ├── theme.ts            # Theme definition
│   └── variables.css       # CSS custom properties
└── utils/
    └── viewportHeight.ts   # Mobile viewport polyfill
```

## Coding Conventions

### Styling
- **Mobile-first**: Always consider mobile experience first
- **Responsive utilities**: Use theme mixins (`responsive()`, `touchOnly()`, `hoverCapable()`)
- **Grid over Flex**: Use CSS Grid for multi-row layouts to avoid single-column stacking
- **No magic numbers**: Use theme spacing/sizing variables
- **Minimal gaps**: 2px between grid elements, larger gaps only where needed

### Performance
- **Debounce user preferences**: 2 second debounce before saving to Supabase
- **Same-value checks**: Prevent unnecessary updates in Metronome engine setters
- **Functional setState**: Use `setPreferences(prev => ...)` to avoid stale closures

### Accessibility
- **Touch targets**: Minimum 44px height for all interactive elements
- **ARIA labels**: Descriptive labels for all controls
- **Keyboard navigation**: Maintain focus indicators (subtle, not orange screaming)

## Recent Major Changes
1. **Grid system implementation** - 82px module for visual consistency
2. **Responsive menu redesign** - CSS Grid prevents mobile overflow
3. **Edge-to-edge mobile layout** - Full viewport width on ≤768px
4. **Preset button minimalism** - Borderless, accent color on interaction only
5. **Touch optimization** - Larger targets, device-specific interactions

## Known Constraints
- No onboarding modal (removed as unnecessary)
- Database saves debounced to 2s (balance between UX and API calls)
- Time signature options limited to common patterns (4/4, 3/4, 6/8, etc.)

## Development Notes
- Use `npm run build` to verify compilation (watch for bundle size changes)
- Test on actual mobile devices when possible (viewport behavior differs)
- Keep bundle size minimal - current main.js ~26KB gzipped
