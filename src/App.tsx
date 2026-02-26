import { ThemeProvider } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { MetronomeProvider } from '@features/Metronome/context/MetronomeProvider';
import Metronome from '@features/Metronome/Metronome';

import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { SessionRunner } from './components/SessionRunner';
import { Sidebar } from './components/Sidebar';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
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
      <Routes>
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route
          path="*"
          element={
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
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
