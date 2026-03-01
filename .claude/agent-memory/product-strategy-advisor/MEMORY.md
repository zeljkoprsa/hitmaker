# Hitmaker - Product Strategy Memory

## Product State (as of 2026-03-01)
- Version: 0.2.0-alpha.1
- Stack: React 18, TypeScript, Emotion, Supabase, PostHog analytics, Workbox PWA
- Branch: main-new (active development)

## Confirmed Features
- Core metronome engine (Web Audio API, precision timing)
- Time signature, subdivision, accent control
- Sound selector (~60 WAV sound pairs, hi/lo)
- Beat visualizer
- Practice sessions: multi-block CRUD, countdown, pause/resume, auto-advance
- Starter sessions: Rudiment Builder, Independence Workout, Groove Warmup, Blast Beat Builder
- Auth: Supabase auth with preference sync (2s debounce)
- PWA: Service worker registered, audio caching (CacheFirst), offline-capable
- Wake Lock API integration (screen stays on during practice)
- Media Session API (lock screen controls, tempo +/- via prev/next track)
- URL shortcuts (?tempo=120&play=true)
- PostHog analytics integrated
- Offline sync queue for preferences

## Architecture Notes
- Sessions stored in localStorage only (not synced to Supabase)
- Playlists section exists as "Coming soon" placeholder in right sidebar
- Left sidebar = session list + editor; Right sidebar = auth + preferences + playlists placeholder
- MetronomeProvider is the central brain: engine state, sound management, preference sync
- `isStarter` flag on sessions distinguishes built-in from user-created

## Key Gaps Identified
- Sessions are localStorage-only (data loss risk, no cross-device)
- No practice history/progress tracking
- Tempo Trainer shipped but ephemeral (sessions not saveable)
- Playlists feature stubbed but not built (PlaylistsSection.tsx is placeholder)
- No sharing/export of sessions
- No keyboard shortcuts documented or comprehensive
- No audio cue at session block transitions
- PostHog integrated but session lifecycle events likely under-instrumented

## Product Roadmap (Agreed 2026-03-01)
### Tier 1 (Next 4-6 weeks)
1. Session cloud sync (Supabase) -- critical path dependency
2. Practice history / session log
3. Auto-advance audio cue at block transitions
4. Keyboard shortcuts (space=play, arrows=tempo, ?=help)

### Tier 2 (Weeks 6-12)
1. Session sharing via URL
2. Save Tempo Trainer generated sessions
3. Playlists (session queue)
4. Practice streak / weekly summary
5. More starter sessions by instrument/genre

### Tier 3 (Months 3-6)
1. Pro tier monetization ($3.99/mo or $29.99/yr)
2. Import/export sessions (JSON)
3. Practice analytics dashboard
4. Polyrhythm mode
5. MIDI clock output

### Explicitly Deferred
- Social features, custom sound upload, onboarding modal, native app, light theme

## Monetization Strategy
- Free: Full metronome, all sounds/time sigs, tempo trainer, 3 saved sessions, 7-day history
- Pro: Unlimited sessions, full history, playlists, cloud sync, sharing
- Do not monetize until 500+ WAU and validated retention
- Price: $3.99/mo or $29.99/yr

## Business Goals (Assumed)
- G1: Grow MAU to 1K+
- G2: Drive retention (D7 > 30%, D30 > 15%)
- G3: Build toward monetization without killing growth
- G4: Protect technical quality and ship velocity

## Design Non-Negotiables
- No onboarding modal
- Minimal visual noise philosophy
- 82px grid module system
- Mobile-first, edge-to-edge on mobile
- Bundle target ~26KB gzipped
