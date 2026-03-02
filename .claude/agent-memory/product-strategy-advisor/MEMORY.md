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
- Sessions synced to Supabase `user_sessions` table (done 2026-03-01)
- Practice history logged to `session_history` table (done 2026-03-01)
- Playlists section exists as "Coming soon" placeholder in right sidebar
- Left sidebar = session list + editor; Right sidebar = auth + preferences + playlists placeholder
- MetronomeProvider is the central brain: engine state, sound management, preference sync
- `isStarter` flag on sessions distinguishes built-in from user-created

## Key Gaps (Updated 2026-03-02)
- Tempo Trainer shipped but ephemeral (sessions not saveable)
- Playlists feature stubbed but not built (PlaylistsSection.tsx is placeholder)
- No sharing/export of sessions
- No keyboard shortcuts documented or comprehensive
- No audio cue at session block transitions
- PostHog integrated but session lifecycle events likely under-instrumented
- No paywall/gating infrastructure for Free vs Pro

## Monetization Strategy (Updated 2026-03-02)
### Agreed Direction: Web-funnel + paid iOS (two-phase)
- **Phase 1 (Months 1-3):** Ship web Free/Pro split to validate willingness to pay
  - Web Free: Full metronome, all sounds/time sigs, starter sessions, 3 saved sessions, 7-day history, Tempo Trainer (generate only)
  - Web Pro: Unlimited sessions, full history, cloud sync, playlists, audio cues, sharing
  - Goal: >2% conversion rate before greenlighting iOS
- **Phase 2 (Months 4-9):** Build paid iOS app ($9.99 one-time purchase)
  - iOS includes all Pro features + native advantages (haptics, widgets, Watch potential)
  - Evaluate whether to keep web Pro or simplify to free web + paid iOS only
- Core metronome is NEVER gated (firm constraint)
- Apple 30% cut factored into pricing; $9.99 one-time preferred over subscription for tool apps
- Do not monetize until 500+ WAU and validated retention

### Web Free/Pro Feature Split
| Feature | Free | Pro |
|---------|------|-----|
| Core metronome, sounds, time sigs | Full | Full |
| Starter sessions | All | All |
| Saved sessions | 3 max | Unlimited |
| Blocks per session | 4 max | Unlimited |
| Tempo Trainer | Generate only | Generate + save + presets |
| Practice history | 7-day rolling | Full history + analytics |
| Streaks | Current only | Full + weekly summary |
| Cloud sync | No | Yes |
| Playlists | No | Yes |
| Audio cue at block transitions | No | Yes |
| Session sharing | No | Yes |

## Product Roadmap (Updated 2026-03-02)
### Completed
- Session cloud sync (Supabase) -- done
- Practice history / session log + streaks -- done

### Tier 1 (Next 4-6 weeks)
1. Web Free/Pro split + Stripe integration (revenue validation)
2. Auto-advance audio cue at block transitions
3. Keyboard shortcuts (space=play, arrows=tempo, ?=help)
4. Save Tempo Trainer generated sessions

### Tier 2 (Weeks 6-12)
1. Session sharing via URL
2. Playlists (session queue)
3. More starter sessions by instrument/genre
4. Practice analytics dashboard (Pro)

### Tier 3 (Months 3-9)
1. iOS app development (if web Pro conversion >2%)
2. Import/export sessions (JSON)
3. Polyrhythm mode
4. MIDI clock output

### Explicitly Deferred
- Social features, custom sound upload, onboarding modal, light theme
- Subscription pricing (one-time purchase preferred for tools)
- Native app development until web monetization validated

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
