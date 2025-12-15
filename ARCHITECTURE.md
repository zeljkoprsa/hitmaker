# Hitmaker Architecture Analysis

## Overview
Hitmaker is a professional-grade metronome application built with React and the Web Audio API. It employs a clean, layered architecture that strictly separates core engine logic from the UI layer.

## Architectural Layers

### 1. React UI Layer (`src/features/Metronome`)
- **Responsibility**: Handles user interaction and visual feedback.
- **State Management**: Uses `MetronomeProvider` (React Context) to manage application state.
- **Components**:
    - `Controls`: Pure presentation components for interacting with the engine.
    - `Displays`: Visualizers driven by high-frequency updates from the engine.
- **Integration**: Communicates with the Core Engine exclusively via `MetronomeContext`.

### 2. Core Engine Layer (`src/core/engine`)
- **Responsibility**: Precise timing and scheduling.
- **Implementation**: `Metronome.ts`
- **Pattern**: Implements the "Lookahead Scheduling" technique (Chris Wilson's method).
    - Uses a `setTimeout` loop (on the main thread) to look ahead and schedule audio events.
    - Uses `AudioContext.currentTime` for precise sub-millisecond audio scheduling.
- **Independence**: The engine is framework-agnostic. It does not depend on React.

### 3. Output Layer (`src/core/output`)
- **Responsibility**: Generating sound.
- **Pattern**: Registry Pattern.
    - `OutputSourceRegistry`: Singleton managing flexible audio backends.
    - `IOutputSource`: Interface for all sound generators.
    - `SampleAudioSource`: Implementation that plays pre-loaded audio buffers (samples).

## Strengths

1.  **Timing Accuracy**: The use of Web Audio API scheduling instead of `setInterval` ensures rock-solid timing (jitter < 1ms), which is critical for a musical tool.
2.  **Separation of Concerns**: The `Metronome` class can be tested, mocked, or ported without touching the UI.
3.  **Extensibility**: The `OutputSourceRegistry` allows adding new sound sources (e.g., synthesized beeps, MIDI output) without changing the engine logic.
4.  **Robustness**: Uses standard `AudioContext` with proper state handling (suspended/running) to handle browser autoplay policies.

## Areas for Improvement (Flaws & Debt)

1.  **State Duplication**:
    - The `MetronomeProvider` maintains a `useState` mirror of the Engine's config (Tempo, Volume, etc.). While currently synced, this bi-directional data flow can lead to "split brain" bugs if the Engine updates itself (e.g., automated tempo ramps).
2.  **Over-Abstraction of Events**:
    - Tick events travel from `Metronome` -> `TickCallback` -> `EventEmitter` (in Provider) -> `Context Consumer`. This extra hop via `events` module in React is slightly redundant.
3.  **Complexity**:
    - The `OutputSourceRegistry` is powerful but adds significant boilerplate for a straightforward sample player.
4.  **Legacy Artifacts**:
    - `src/dev` contains documentation for a previous monorepo structure that no longer exists.

## Tech Stack
- **Framework**: React 18 (Create React App / CRACO)
- **Language**: TypeScript
- **Audio**: Web Audio API (Native, no Tone.js)
- **Styling**: CSS Modules / Emotion
- **State**: React Context
