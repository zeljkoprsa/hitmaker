import { ThemeProvider } from '@emotion/react';
import React, { useEffect, useState } from 'react';

import { MetronomeProvider } from '@features/Metronome/context/MetronomeProvider';
import Metronome from '@features/Metronome/Metronome';

import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { Sidebar } from './components/Sidebar';
import { SessionRunner } from './components/SessionRunner';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import './App.module.css';
import { theme } from './styles/theme';
import './styles/fonts.css';
import './styles/variables.css';
import { initViewportHeight } from './utils/viewportHeight';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  useEffect(() => {
    initViewportHeight();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <ToastProvider>
          <MetronomeProvider>
            <SessionProvider>
              <div className="metronome-app">
                <Header
                  onOpenSidebar={() => setIsSidebarOpen(true)}
                  onOpenLeftSidebar={() => setIsLeftSidebarOpen(true)}
                />
                <Metronome />
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <LeftSidebar
                  isOpen={isLeftSidebarOpen}
                  onClose={() => setIsLeftSidebarOpen(false)}
                />
                <SessionRunner />
              </div>
            </SessionProvider>
          </MetronomeProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
