# Technical Backlog

## High Priority

- [x] **Cleanup Documentation**: Remove obsolete files from `src/dev` (`tryuseless-mono-repo-plan.md`) that reference the old monorepo structure.
- [x] **Verify Test Suite**: Run `npm test` to ensure the decoupling didn't break core engine tests (`src/core/engine/__tests__`).
- [x] **Consolidate Types**: Review `src/features/Metronome/types.ts` vs `src/core/types` to reduce duplication.

## High Priority
- [x] **PWA Offline Support**: Enable Service Worker to cache app shell and audio assets, allowing offline use.
- [x] **Screen Wake Lock**: Prevent device from sleeping while metronome is active (`navigator.wakeLock`).
- [x] **PWA Installability**: Configure `manifest.json` with proper metadata, icons, and `standalone` display for "App-like" experience.

## Medium Priority

- [x] **Optimize State Sync**: Refactor `MetronomeProvider` to subscribe to the Engine's state rather than manually mirroring every setter. Implemented using `useSyncExternalStore`.
- [x] **Simplify Event Stream**: The `MetronomeProvider` now listens directly to engine changes via `subscribe` and `getSnapshot`, removing the need for intermediate event duplication in React state.
- [ ] **Enhance Subdivision Logic**: The current `subdivisionMap` ('1' -> 'quarter') is a loose string mapping. Strict typing should be enforced from the UI down to the Engine.

## Completed
- [x] **Cleanup Documentation**: Remove obsolete files from `src/dev` (`tryuseless-mono-repo-plan.md`) that reference the old monorepo structure.
- [x] **Verify Test Suite**: Run `npm test` to ensure the decoupling didn't break core engine tests (`src/core/engine/__tests__`).
- [x] **Consolidate Types**: Review `src/features/Metronome/types.ts` vs `src/core/types` to reduce duplication.
- [x] **UI State Sync**: Fixed race conditions and HMR issues causing UI to de-sync from Engine.
- [x] **Audio Assets**: Integrated high-quality sample library and fixed `EncodingError` on dummy files.


## Low Priority (Future)

- [x] **Media Session API**: Allow control of metronome (Play/Pause) from lock screen and headphone buttons.
- [x] **App Shortcuts**: specific shortcuts in `manifest.json` supported by query string parsing in `MetronomeProvider`.
- [ ] **MIDI Output**: Implement a `MidiOutputSource` implementing `IOutputSource` to drive external hardware.
- [ ] **Tempo Ramping**: Add ability to automate tempo changes (requires Engine state to drive React state, see "Optimize State Sync").
- [ ] **Visualizer Optimization**: Ensure `BeatVisualizer` uses `requestAnimationFrame` effectively and doesn't trigger React renders for every frame (it seems to use `TickEvent` which is good).
