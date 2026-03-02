import { ThemeProvider } from '@emotion/react';
import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { MetronomeProvider } from '@features/Metronome/context/MetronomeProvider';
import Metronome from '@features/Metronome/Metronome';

import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { SessionRunner } from './components/SessionRunner';
import { AuthProvider } from './context/AuthContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import { useSessionHistory } from './hooks/useSessionHistory';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import './App.module.css';
import { theme } from './styles/theme';
import './styles/fonts.css';
import './styles/variables.css';
import { initViewportHeight } from './utils/viewportHeight';

const AppInner: React.FC = () => {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const { streak, loadHistory } = useSessionHistory();
  const { sessionPhase } = useSession();
  const prevPhaseRef = useRef(sessionPhase);

  useEffect(() => {
    if (prevPhaseRef.current === 'running' && sessionPhase === 'idle') {
      loadHistory();
    }
    prevPhaseRef.current = sessionPhase;
  }, [sessionPhase, loadHistory]);

  return (
    <div className="app-shell">
      <LeftSidebar isOpen={isLeftSidebarOpen} onClose={() => setIsLeftSidebarOpen(false)} />
      <div className={`metronome-app${isLeftSidebarOpen ? ' sidebar-open' : ''}`}>
        <Header onOpenLeftSidebar={() => setIsLeftSidebarOpen(true)} streak={streak} />
        <Metronome />
        <SessionRunner />
      </div>
    </div>
  );
};

const App: React.FC = () => {
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
                    <AppInner />
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
