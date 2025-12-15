# Technical Backlog

## High Priority

- [x] **Cleanup Documentation**: Remove obsolete files from `src/dev` (`tryuseless-mono-repo-plan.md`) that reference the old monorepo structure.
- [x] **Verify Test Suite**: Run `npm test` to ensure the decoupling didn't break core engine tests (`src/core/engine/__tests__`).
- [x] **Consolidate Types**: Review `src/features/Metronome/types.ts` vs `src/core/types` to reduce duplication.

## Medium Priority

- [ ] **Optimize State Sync**: Refactor `MetronomeProvider` to subscribe to the Engine's state rather than manually mirroring every setter. Consider using `useSyncExternalStore` (React 18) for the Engine connection.
- [ ] **Simplify Event Stream**: Remove the intermediate `EventEmitter` in `MetronomeProvider` and expose the Engine's `onTick` subscription directly or via a lighter hook.
- [ ] **Enhance Subdivision Logic**: The current `subdivisionMap` ('1' -> 'quarter') is a loose string mapping. Strict typing should be enforced from the UI down to the Engine.

## Low Priority (Future)

- [ ] **MIDI Output**: Implement a `MidiOutputSource` implementing `IOutputSource` to drive external hardware.
- [ ] **Tempo Ramping**: Add ability to automate tempo changes (requires Engine state to drive React state, see "Optimize State Sync").
- [ ] **Visualizer Optimization**: Ensure `BeatVisualizer` uses `requestAnimationFrame` effectively and doesn't trigger React renders for every frame (it seems to use `TickEvent` which is good).
