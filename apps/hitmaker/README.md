# Metrodome

A modern, minimal metronome built to help musicians practice with precision timing and customizable settings. Currently in alpha stage (v0.2.0-alpha.1).

## Features

### Currently Implemented

1. **Tempo Control**

   - Adjustable BPM (Beats Per Minute) from 30 to 500
   - Visual display of current tempo
   - Keyboard shortcuts for play/pause (spacebar) and tempo adjustment (arrow keys)
   - Fine-tuning tempo adjustment buttons

2. **Time Signature Selection**

   - Support for common time signatures (e.g., 4/4, 3/4, 6/8)
   - Visual representation of selected time signature
   - Dedicated TimeSignatureDisplay component

3. **Tap Tempo**

   - Set tempo by tapping a button
   - Intelligent averaging for accurate tempo detection

4. **Advanced Audio Engine**

   - ToneAudioEngine using Tone.js for precise timing
   - Excellent timing precision (≤0.5ms jitter)
   - Volume control with smooth transitions

5. **Beat Visualization**

   - BeatVisualizer component for visual representation of current beat
   - Visual feedback synchronized with audio

6. **Subdivision Control**

   - Support for quarter and eighth note subdivisions
   - User-selectable subdivision types

7. **Modern UI**

   - Chakra UI components for responsive design
   - Custom DepartureMono font for consistent typography
   - Volume slider for adjusting metronome volume

8. **Analytics**
   - PostHog integration for anonymous usage analytics
   - Performance monitoring
   - User interaction tracking

### Planned Features

- Advanced rhythm patterns
- Practice tools (gradual tempo changes, A/B looping)
- Dark/light mode theme switching
- Set lists for saving and recalling settings
- Additional subdivision options (triplets, sixteenth notes)
- Polyrhythm support
- Offline functionality
- Performance optimizations

## Getting Started

### Prerequisites

- Node.js (version 16 or later recommended)
- npm (version 8 or later recommended)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/zeljkoprsa/metrodome.git
   ```

2. Navigate to the project directory:

   ```
   cd metrodome
   ```

3. Install dependencies:

   ```
   npm install
   ```

4. Start the development server:

   ```
   npm start
   ```

5. Open your browser and visit `http://localhost:3456` to see the app running.

## Project Structure

The project follows a feature-based organization with TypeScript:

- `src/`: Contains the source code
  - `core/`: Core functionality and types
    - `engine/`: Metronome engine implementation
    - `types/`: TypeScript type definitions
  - `features/`: Feature-based components and logic
    - `Metronome/`: Main metronome feature
      - `components/`: UI components (Controls, Displays)
      - `context/`: React context providers
      - `hooks/`: Custom React hooks
  - `styles/`: Global styles and theme configuration
  - `dev/`: Development-related documentation and tools
- `public/`: Static assets and HTML template
- `package.json`: Project dependencies and scripts

## Development

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm start:network`: Runs the app accessible on your local network
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run format`: Format code with Prettier
- `npm run lint`: Run ESLint to check code quality
- `npm run lint:fix`: Automatically fix linting issues

### Coding Standards

- TypeScript for type safety with strict mode
- React functional components with hooks
- Emotion for CSS-in-JS styling
- Chakra UI for component library
- ESLint and Prettier for code quality
- Jest and React Testing Library for tests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Emotion](https://emotion.sh/) - CSS-in-JS styling
- [PostHog](https://posthog.com/) - Open-source product analytics
- [Craco](https://github.com/dilanx/craco) - Create React App configuration override

## Contact

Željko Prša - [GitHub](https://github.com/zeljkoprsa)

Project Link: [https://github.com/zeljkoprsa/metrodome](https://github.com/zeljkoprsa/metrodome)
