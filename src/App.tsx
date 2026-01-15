import { ThemeProvider } from '@emotion/react';
import React from 'react';

import { MetronomeProvider } from '@features/Metronome/context/MetronomeProvider';
import Metronome from '@features/Metronome/Metronome';

import AuthButton from './components/Auth/AuthButton';
import OnboardingModal from './components/OnboardingModal';
import SyncStatus from './components/SyncStatus';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import './App.module.css';
import { theme } from './styles/theme';
import './styles/fonts.css';
import './styles/variables.css'; // Import CSS variables

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ToastProvider>
          <MetronomeProvider>
            <div className="metronome-app">
              <OnboardingModal />
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  zIndex: 100,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <SyncStatus />
                <AuthButton />
              </div>
              <Metronome />
            </div>
          </MetronomeProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
