# Technical Concepts in Metrodome

This document explains the key technical concepts used in the Metrodome application, making them accessible for both developers and product managers.

## Architecture Concepts

1. **Modularity**
   - What It Is: Breaking down software into independent, interchangeable pieces
   - Real Example: Our metronome engine is separate from the UI components
   - Why It Matters: Makes it easier to add new features without breaking existing ones

2. **Output Source Registry**
   - What It Is: A central registry that manages different output sources
   - Example: Our `OutputSourceRegistry` manages the `WebAudioSource`
   - Why It Matters: Allows for multiple output types (audio, visual, etc.) with a unified interface

3. **Interfaces**
   ```typescript
   // Example of an interface
   interface IOutputSource {
     processTick(tickEvent: ITickEvent): Promise<void>;
     setVolume(level: number): void;
     setEnabled(enabled: boolean): void;
   }
   ```
   - What It Is: A contract that defines what methods a component must implement
   - Why It Matters: Ensures different parts of the app can work together reliably

4. **State Management**
   - What It Is: How the app keeps track of its current condition
   - Example: Current tempo, whether metronome is playing, current time signature
   - Why It Matters: Keeps everything synchronized and working together

## Technical Terms

1. **Type Safety**
   ```typescript
   // Type-safe code
   function setTempo(bpm: number) {
     // Can only accept numbers
   }
   ```
   - What It Is: Preventing errors by enforcing data types
   - Why It Matters: Catches errors before they happen

2. **React Context**
   ```typescript
   // React Context example
   const MetronomeContext = createContext({
     tempo: 120,
     setTempo: (newTempo: number) => {}
   });
   ```
   - What It Is: A way to share data between components without passing it manually
   - Why It Matters: Makes it easier to manage shared state

## Web Audio API Concepts

1. **AudioContext**
   - What It Is: The main entry point to the Web Audio API
   - Usage: Creates and manages audio nodes and timing
   - Why It Matters: Provides precise timing for metronome beats

2. **AudioBuffer**
   ```typescript
   // Creating an audio buffer
   const buffer = audioContext.createBuffer(
     1, // channels (mono)
     sampleRate * duration, // number of samples
     sampleRate // sample rate
   );
   ```
   - What It Is: Raw audio data in memory
   - Usage: Stores synthesized click sounds
   - Why It Matters: Allows for custom sound generation

3. **AudioNode**
   - What It Is: Building blocks for audio processing
   - Examples: GainNode (volume), OscillatorNode (tone generation)
   - Why It Matters: Creates the audio processing chain

## Metronome-Specific Concepts

1. **Tick Event**
   ```typescript
   interface ITickEvent {
     time: number;       // When the tick should play
     beat: number;      // Current beat in the measure
     subdivision: number; // Subdivision position
     isAccent: boolean; // Whether this is an accented beat
   }
   ```
   - What It Is: Data structure representing a metronome tick
   - Why It Matters: Contains all information needed to process a beat

2. **Look-ahead Scheduling**
   - What It Is: Scheduling audio events slightly ahead of when they should play
   - Example: Our metronome schedules ticks 100ms in advance
   - Why It Matters: Ensures precise timing without jitter

3. **Envelope Shaping**
   - What It Is: Controlling how a sound changes over time
   - Example: Our click sound has attack, sustain, and decay phases
   - Why It Matters: Creates natural-sounding clicks without abrupt cutoffs

## Project Architecture

1. **Core Engine Layer**
   - What It Is: The foundation that handles timing and audio generation
   - Components: Metronome class, OutputSourceRegistry, WebAudioSource
   - Why It Matters: Provides reliable, precise timing independent of UI

2. **Feature Layer**
   - What It Is: User-facing components and functionality
   - Components: MetronomeProvider, UI controls, displays
   - Why It Matters: Provides intuitive interface for users

3. **Communication Flow**
   ```
   User Input → React Components → MetronomeProvider → Metronome Engine → OutputSourceRegistry → WebAudioSource → Speakers
   ```
   - What It Is: How data and commands flow through the application
   - Why It Matters: Understanding this helps when debugging or adding features

## When Planning New Features, Consider:

1. **Engine Integration**: How will it interact with the metronome engine?
2. **State Management**: What data needs to be tracked in the MetronomeProvider?
3. **Output Sources**: Will it require new types of output sources?
4. **Event Handling**: What events need to be processed?
5. **Performance Impact**: Will it affect timing precision?