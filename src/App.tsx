import { ThemeProvider } from '@emotion/react';
import React from 'react';

import { MetronomeProvider } from '@features/Metronome/context/MetronomeProvider';
import Metronome from '@features/Metronome/Metronome';

import './App.module.css';
import { theme } from './styles/theme';
import './styles/fonts.css';
import './styles/variables.css'; // Import CSS variables

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <MetronomeProvider>
        <div className="metronome-app">
          <Metronome />
        </div>
      </MetronomeProvider>
    </ThemeProvider>
  );
};

export default App;
