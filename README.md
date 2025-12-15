# Hitmaker

A modern, minimal metronome built to help musicians practice with precision timing and customizable settings.

**[Architecture Overview](ARCHITECTURE.md)** | **[Technical Backlog](BACKLOG.md)**

### Detailed Documentation
- **[Technical Concepts](docs/technical-concepts.md)**
- **[Technical Notes](docs/tech-notes.md)**
- **[Architecture Diagram](docs/metronome-architecture.md)**

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

3. **Tap Tempo**
   - Set tempo by tapping a button
   - Intelligent averaging for accurate tempo detection

4. **Advanced Audio Engine**
   - Custom Web Audio API engine for precise timing (≤0.5ms jitter)
   - Sample-based high-fidelity playback
   - Volume control with smooth transitions

5. **Beat Visualization**
   - BeatVisualizer component for visual representation of current beat
   - Visual feedback synchronized with audio

6. **Subdivision Control**
   - Support for quarter and eighth note subdivisions
   - User-selectable subdivision types

7. **Modern UI**
   - Responsive design
   - Custom fonts for consistent typography

8. **Analytics**
   - PostHog integration for anonymous usage analytics

## Getting Started

### Prerequisites

- Node.js (version 16 or later recommended)
- npm (version 8 or later recommended)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zeljkoprsa/hitmaker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd hitmaker
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm start
   ```

5. Open your browser and visit `http://localhost:3000` to see the app running.

## Project Structure

The project follows a feature-based organization with TypeScript:

- `src/`: Contains the source code
  - `core/`: Core functionality (Engine, Output, Types)
  - `features/`: Feature-based components (Metronome UI, Context)
  - `shared/`: Shared utilities
  - `styles/`: Global styles
- `public/`: Static assets

## Development

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run format`: Format code with Prettier
- `npm run lint`: Run ESLint to check code quality

## License

This project is licensed under the MIT License.

## Contact

Željko Prša - [GitHub](https://github.com/zeljkoprsa)

Project Link: [https://github.com/zeljkoprsa/hitmaker](https://github.com/zeljkoprsa/hitmaker)
