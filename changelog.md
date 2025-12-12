# Changelog

All notable changes to the Metronome App project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.2.0-alpha.1] - 2025-05-29

### Added
- PostHog analytics integration for tracking user interactions and app usage
- Initial project setup with React and TypeScript
- Basic tempo control functionality
- Time signature selection feature
- Web Audio Engine for precise timing
- Tap tempo functionality
- TempoDisplay component for showing current tempo and time signature
- TempoControl component for adjusting tempo and play/pause functionality
- TapTempo component for setting tempo by tapping
- TimeSignatureSelector component for changing time signature
- Audio initialization in App component
- Tempo adjustment buttons for fine-tuning
- Custom useMetronome hook for centralized metronome logic and state management
- Keyboard shortcuts for play/pause (spacebar) and tempo adjustment (arrow keys)
- Introduced Chakra UI for Frontend elements
- Added a Drawer that hold Time Signature Selector and a Placeholder for Beat Subdivision
- Implemented new ToneAudioEngine using Tone.js library for improved audio capabilities and precise timing
- Integrated Storybook for component development and documentation

BeatVisualizer Component
- Added BeatVisualizer.tsx in src/features/Metronome/components/Displays/
- Provides visual representation of the current beat within the time signature.

TimeSignatureDisplay Component
  - Added TimeSignatureDisplay.tsx in src/features/Metronome/components/Displays/
  - Displays the current time signature numerically.
SubdivisionControl Component
  - Added SubdivisionControl.tsx in src/features/Metronome/components/Controls/
  - Allows users to select beat subdivisions like eighth notes, triplets, etc.

Volume Control
  - Implemented volume slider in Metronome.tsx using Tone.Destination.volume
  - Users can now adjust the master volume of the metronome.

EventEmitter for Beat Events
- Introduced EventEmitter in MetronomeContext.tsx for emitting beat events.
- Enables components to respond to beat changes in real-time.

Custom Fonts
- Loaded DepartureMono font in index.tsx for consistent typography.

### Changed
- Improved WebAudioEngine with more robust implementation:
  - Added a scheduler using Web Worker for precise timing
  - Implemented efficient sound loading and playback mechanisms
  - Added volume control with exponential ramping for smoother transitions
  - Implemented methods for stopping all sounds and checking if sounds are loaded
  - Added ability to preload all sounds for better performance
  - Improved error handling and logging for audio operations
- Removed all CSS styling from components to prepare for new layout implementation
- Updated App, TempoControl, TempoDisplay, and TimeSignatureSelector components to remove styling references
- Refactored App component to use the new useMetronome hook
- Improved event handling structure with centralized state management in useMetronome hook
- State management is centralized using the Context API.
- Replaced WebAudioEngine with ToneAudioEngine for improved audio performance and features
- Made minor UI improvements and adjustments
- Metronome Component Structure
	-	Updated Metronome.tsx to integrate new controls and displays.
	-	Refactored layout using Chakra UI components for better responsiveness.
	-	Context API Enhancements
	-	Improved MetronomeContext.tsx with additional state variables like accents and subdivision.
	-	Enhanced state management for more granular control over metronome features.


### Deprecated

### Removed
- CSS modules for component-specific styling
- Tempo.css file
- App.module.css file
- All className attributes from components
- WebAudioEngine implementation, replaced by ToneAudioEngine

### Fixed
- BeatMeasureGrid component tests:
  - Added data-testid attributes to grid container and items for reliable testing
  - Fixed grid structure and active beat highlighting tests
  - Replaced animation-specific test with more reliable grid item count test
  - Improved test maintainability by focusing on component functionality rather than implementation details

### Security

## [0.1.0] - 2024-08-10
- Initial development version

[Unreleased]: https://github.com/zeljkoprsa/metrodome/compare/v0.2.0-alpha.1...HEAD
[0.2.0-alpha.1]: https://github.com/zeljkoprsa/metrodome/compare/v0.1.0...v0.2.0-alpha.1
[0.1.0]: https://github.com/zeljkoprsa/metrodome/releases/tag/v0.1.0
