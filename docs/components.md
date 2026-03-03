# Hitmaker — UI Component Map

## Layout Zones

```
┌─────────────────────────────────────┐
│  Header (hamburger · logo · streak) │  ← fixed top, respects safe-area-inset-top
├─────────────────────────────────────┤
│                                     │
│         Metronome (center)          │  ← main content
│                                     │
│  Beat Visualizer                    │
│  Accent Presets                     │
│  [ Start/Stop ]  [ TAP ]            │
│  [Time Sig] [120 BPM] [Subdivision] │
│  ──── Tempo Slider ────             │
│  Sound Selector                     │
│                                     │
├─────────────────────────────────────┤
│  Session Runner (when active)       │  ← fixed overlay
└─────────────────────────────────────┘

◀ LeftSidebar (slide-out push-drawer)
```

---

## Header
**`src/components/Header/`**

- Hamburger menu button → opens LeftSidebar
- Hitmaker logo (SVG)
- Streak badge (🔥 N-day, only when streak > 0)
- Position: `absolute`, offset by `calc(spacing.lg + env(safe-area-inset-top))`

---

## LeftSidebar
**`src/components/LeftSidebar/`**

Slide-out push-drawer. Five internal views switched via local state:

| View | File | What's in it |
|------|------|-------------|
| `list` | `SessionList.tsx` | Tempo Trainer shortcut, Starter sessions, My Sessions, New Session button, History link |
| `edit` | `SessionEditor.tsx` | Session name input + block editor (tempo, time sig, subdivision, duration per block) |
| `trainer` | `TempoTrainerForm.tsx` | Preset cards + custom Start/End BPM / increment config |
| `history` | `SessionHistory.tsx` | Date-grouped session completions, streak banner |
| `account` | `Sidebar/` components | Profile + sync status + preferences export — or Sign In/Up form for guests |

**AccountFooter** (`AccountFooter.tsx`) is always visible at the bottom:
- Logged in: avatar initial + email + sync dot (green = synced, orange/pulsing = saving, yellow = offline)
- Guest: person icon + "Sign In →"
- Tapping opens the account view

---

## Metronome
**`src/features/Metronome/`**

Central control panel. All sub-components live in `src/features/Metronome/components/`.

| Sub-component | Path | What it does |
|--------------|------|-------------|
| **BeatVisualizer** | `Displays/BeatVisualizer` | Row of circles (one per beat in time signature); tap to cycle accent: Normal → Accent → Mute |
| **AccentControl** | `Controls/AccentControl` | Preset buttons (Standard, Clave, Jazz…) — applies full accent patterns in one tap |
| **StartStopButton** | `Controls/StartStopButton` | Large (~120px) play/pause with animated icon swap |
| **TapTempoControl** | `Controls/TapTempoControl` | TAP button — 3+ taps within 2s sets the BPM |
| **TimeSignatureControl** | `Controls/TimeSignatureControl` | ScrollPickerMenu — 4/4, 3/4, 6/8, 5/4, 7/8… |
| **TempoDisplay** | `Displays/TempoDisplay` | Read-only large BPM number |
| **SubdivisionControl** | `Controls/SubdivisionControl` | ScrollPickerMenu — quarter / eighth / sixteenth note icons |
| **TempoSlider** (TempoControl) | `Controls/TempoControl` | Full-width drag slider with momentum physics, elastic bounds (40–500 BPM) |
| **SoundSelector** | `Controls/SoundSelector/` | Dropdown grid — selects click sound (Quartz, Wood, Digital…) |
| **ScrollPickerMenu** | `Controls/ScrollPickerMenu` | Shared horizontal scroll picker used by TimeSignature and Subdivision controls |

---

## SessionRunner
**`src/components/SessionRunner/`**

Lifecycle overlays rendered on top of the metronome during an active practice session.

| Phase | Visual |
|-------|--------|
| `preview` | Full-screen overlay: session name, block 1 preview (BPM / time sig / label), "Let's Go" + Cancel buttons |
| `countdown` | Full-screen overlay: large animated countdown number (5→0) |
| `running` / `paused` | Fixed bar: session name · block N/total · elapsed timer (turns red when overtime) · Pause / Restart / Next / End controls |

---

## Auth & Account
**`src/components/Sidebar/`** and **`src/components/Auth/`**

| Component | What it does |
|-----------|-------------|
| `SignInView.tsx` | Email/password + Google OAuth sign-in/sign-up tabs |
| `ProfileSection.tsx` | Avatar, email, member-since date, sync status dot + label |
| `PreferencesSection.tsx` | Current tempo/time sig/sound display, Export Preferences JSON button |
| `ResetPasswordModal.tsx` | Password reset flow |
| `UserAvatar.tsx` | Avatar circle with user initial |

---

## Context / Data Layer

These providers are invisible in the UI but drive all state:

| Provider | File | Owns |
|----------|------|------|
| **MetronomeProvider** | `src/features/Metronome/context/MetronomeProvider.tsx` | tempo, timeSignature, subdivision, accents, volume, muted, soundId, isPlaying, isSaving — backed by the Metronome engine class |
| **SessionProvider** | `src/context/SessionContext.tsx` | sessions CRUD, activeSession, currentBlockIndex, sessionPhase, countdown, block timer |
| **AuthProvider** | `src/context/AuthContext.tsx` | user (Supabase User or null), signOut |
| **ToastProvider** | `src/context/ToastContext.tsx` | Transient toast notifications (showToast) |
| **ThemeProvider** | Emotion / `src/styles/theme.ts` | Design tokens — colors, spacing, typography, breakpoints |

---

## PWA / App Shell
**`src/hooks/useAppUpdate.ts`** — SW update detection + pull-to-refresh
**`src/serviceWorkerRegistration.ts`** — Workbox SW registration with `onUpdate` callback
**`src/index.tsx`** — Dispatches `swUpdateAvailable` custom event on SW update

Update banner and pull-to-refresh indicator are rendered inline in `AppInner` (`src/App.tsx`).

---

## Key Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useSessionHistory` | `src/hooks/useSessionHistory.ts` | Fetches last 90 session completions, computes streak |
| `usePreferences` | `src/hooks/usePreferences.ts` | Load/save user preferences to Supabase `user_preferences` table |
| `useAppUpdate` | `src/hooks/useAppUpdate.ts` | SW update state + pull-to-refresh gesture |
| `useResponsive` | `src/hooks/useResponsive.ts` | Breakpoint detection |
| `useWakeLock` | `src/hooks/useWakeLock.ts` | Prevents screen sleep during metronome playback |
| `useMediaSession` | `src/hooks/useMediaSession.ts` | Media session API (lock screen controls) |
