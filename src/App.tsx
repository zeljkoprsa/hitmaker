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
import { useAppUpdate } from './hooks/useAppUpdate';
import { useSessionHistory } from './hooks/useSessionHistory';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import './App.module.css';
import { theme } from './styles/theme';
import './styles/fonts.css';
import './styles/variables.css';
import { initViewportHeight } from './utils/viewportHeight';

type SectionType = 'practice' | 'history' | 'account';

const AppInner: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);
  const { streak, loadHistory } = useSessionHistory();
  const { sessionPhase } = useSession();
  const prevPhaseRef = useRef(sessionPhase);
  const { updateAvailable, applyUpdate, pullProgress } = useAppUpdate();

  useEffect(() => {
    document.body.style.overscrollBehaviorY = 'contain';
  }, []);

  useEffect(() => {
    if (prevPhaseRef.current === 'running' && sessionPhase === 'idle') {
      loadHistory();
    }
    prevPhaseRef.current = sessionPhase;
  }, [sessionPhase, loadHistory]);

  return (
    <div className="app-shell">
      {/* Update banner */}
      {updateAvailable && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '10px 16px',
          background: '#1a1a1a',
          borderBottom: '1px solid #333',
          fontSize: '14px',
          color: '#ccc',
        }}>
          <span>New version available</span>
          <button
            onClick={applyUpdate}
            style={{
              background: '#F64105',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 14px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '28px',
            }}
          >
            Update
          </button>
        </div>
      )}

      {/* Pull-to-refresh indicator */}
      {pullProgress > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9998,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '8px',
          pointerEvents: 'none',
          opacity: pullProgress,
          transform: `translateY(${pullProgress * 8}px)`,
          transition: 'opacity 0.1s, transform 0.1s',
        }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            style={{
              transform: `rotate(${pullProgress * 180}deg)`,
              transition: 'transform 0.1s',
            }}
          >
            <circle cx="11" cy="11" r="9" stroke="#555" strokeWidth="2" />
            <path d="M11 6v5l3 3" stroke="#F64105" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      <LeftSidebar
        activeSection={activeSection}
        onSetSection={setActiveSection}
        onClose={() => setActiveSection(null)}
      />
      <div
        className={`metronome-app${activeSection !== null ? ' panel-open' : ''}`}
        onClick={() => {
          // Desktop click-outside: collapse panel (rail stays)
          if (window.matchMedia('(min-width: 1024px)').matches && activeSection !== null) {
            setActiveSection(null);
          }
        }}
      >
        <Header onOpenLeftSidebar={() => setActiveSection('practice')} streak={streak} />
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
