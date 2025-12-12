# Metrodome Project Structure

metrodome/
├── public/ # Static assets
│ ├── assets/
│ │ └── sounds/ # Metronome sound files
│ └── fonts/
│ └── DepartureMono/ # Custom font files
│
├── src/
│ ├── features/ # Feature-based modules
│ │ └── Metronome/ # Main metronome feature
│ │ ├── components/ # React components with Emotion styling
│ │ │ ├── AnimationWrapper.tsx # Animation wrapper for framer-motion
│ │ │ ├── Controls/ # Input components
│ │ │ │ ├── StartStopButton.tsx
│ │ │ │ ├── SubdivisionControl.tsx
│ │ │ │ ├── TapTempoControl.tsx
│ │ │ │ ├── TempoControl.tsx
│ │ │ │ ├── TimeSignatureControl.tsx
│ │ │ │ ├── VolumeControl.tsx
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ ├── Displays/ # Output components
│ │ │ │ ├── BeatVisualizer.tsx
│ │ │ │ ├── TempoDisplay.tsx
│ │ │ │ └── index.ts
│ │ │ │
│ │ │ └── index.ts
│ │ │
│ │ ├── context/ # React Context for state management
│ │ │ └── MetronomeProvider.tsx # Unified context provider
│ │ │
│ │ ├── hooks/ # Custom React hooks
│ │ │ └── useCollapsibleControl.ts
│ │ │
│ │ ├── types.ts # TypeScript definitions
│ │ ├── Metronome.tsx # Main component
│ │ └── index.ts # Feature exports
│ │
│ ├── core/ # Core application utilities
│ │ ├── engine/ # Metronome engine implementation
│ │ │ ├── Metronome.ts # Web Audio API metronome implementation
│ │ │ └── __tests__/ # Engine tests
│ │ ├── interfaces/ # Core interfaces
│ │ │ ├── IOutputSource.ts # Output source interface
│ │ │ ├── ITickEvent.ts # Tick event interface
│ │ │ └── index.ts
│ │ ├── output/ # Output source implementations
│ │ │ ├── BaseOutputSource.ts # Abstract base class
│ │ │ ├── OutputSourceRegistry.ts # Registry for output sources
│ │ │ └── WebAudioSource.ts # Web Audio API implementation
│ │ └── types/ # Core type definitions
│ │   └── MetronomeTypes.ts # Metronome configuration types
│ │
│ ├── shared/ # Shared components and utilities
│ ├── styles/ # Global styles and theme
│ ├── dev/ # Development documentation
│ │ ├── metronome-architecture.md # Architecture diagram
│ │ ├── project-structure.md # This file
│ │ ├── tech-notes.md # Technical implementation notes
│ │ └── technical-concepts.md # Core concepts explained
│ │
│ ├── App.tsx # Root component
│ ├── App.module.css # Root styles
│ ├── index.tsx # Entry point
│ └── index.css # Global styles
│
├── .env # Environment variables
├── .gitignore # Git ignore rules
├── package.json # Dependencies and scripts
├── tsconfig.json # TypeScript configuration
└── README.md # Project documentation
