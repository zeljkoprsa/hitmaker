import { ThemeProvider } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import { MetronomeProvider } from '@features/Metronome/context/MetronomeProvider';
import Metronome from '@features/Metronome/Metronome';

import { AccountPanel } from './components/AccountPanel';
import { AppNav, ViewType } from './components/AppNav';
import { CoachStage } from './components/CoachStage';
import { GlobalPlaybackControls } from './components/GlobalPlaybackControls';
import { Header } from './components/Header';
import JournalView from './components/Journal/JournalView';
import { ReflectionPrompt } from './components/Journal/ReflectionPrompt';
import { SessionRunner } from './components/SessionRunner';
import StageView from './components/StageView';
import CatalogView from './components/views/CatalogView';
import SessionsView from './components/views/SessionsView';
import { AuthProvider } from './context/AuthContext';
import { JournalProvider } from './context/JournalContext';
import { LessonProvider } from './context/LessonContext';
import { LessonsProvider } from './context/LessonsContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { ToastProvider } from './context/ToastContext';
import { useAppUpdate } from './hooks/useAppUpdate';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import './App.module.css';
import { theme } from './styles/theme';
import './styles/fonts.css';
import './styles/variables.css';
import { initViewportHeight } from './utils/viewportHeight';

const AppInner: React.FC = () => {
  // Center stage is a swappable view region; the sidebar is persistent nav
  // (JAK-50). The metronome is one view among Catalog / Sessions / Journal.
  const [activeView, setActiveView] = useState<ViewType>('metronome');
  const [accountOpen, setAccountOpen] = useState(false);
  const { sessionPhase, activeSession } = useSession();
  // A guided lesson run takes over center stage (CoachStage) regardless of
  // the selected view — the immersive case of the same swap pattern. Ordinary
  // metronome/session runs keep the RunnerBar pinned across every view.
  const isGuidedRun = Boolean(activeSession?.guided) && sessionPhase !== 'idle';
  const { updateAvailable, applyUpdate, pullProgress } = useAppUpdate();

  useEffect(() => {
    document.body.style.overscrollBehaviorY = 'contain';
  }, []);

  // Starting any run drops you onto the metronome view as the run's backdrop
  const goMetronome = () => setActiveView('metronome');

  const renderView = () => {
    if (isGuidedRun) return <CoachStage />;
    switch (activeView) {
      case 'catalog':
        return <CatalogView onStartRun={goMetronome} />;
      case 'sessions':
        return <SessionsView onStartRun={goMetronome} />;
      case 'journal':
        return (
          <StageView title="Journal">
            <JournalView />
          </StageView>
        );
      case 'metronome':
      default:
        return (
          <div className="metronome-view">
            <Header />
            <div className="metronome-slot">
              <Metronome />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-shell">
      <GlobalPlaybackControls />
      {/* Update banner */}
      {updateAvailable && (
        <div
          style={{
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
          }}
        >
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
        <div
          style={{
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
          }}
        >
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

      <AppNav
        activeView={activeView}
        onSetView={setActiveView}
        onOpenAccount={() => setAccountOpen(true)}
        accountActive={accountOpen}
      />
      <main className="stage">
        <div className="stage__view">{renderView()}</div>
        <SessionRunner />
      </main>

      <AccountPanel open={accountOpen} onClose={() => setAccountOpen(false)} />
      {/* Optional post-run reflection prompt (spec #6) */}
      <ReflectionPrompt />
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    initViewportHeight();
    // Spec #4 removed the practice Queue; clear its persisted remnant
    localStorage.removeItem('hitmaker_queue');
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
                  <JournalProvider>
                    <LessonsProvider>
                      <SessionProvider>
                        <LessonProvider>
                          <AppInner />
                        </LessonProvider>
                      </SessionProvider>
                    </LessonsProvider>
                  </JournalProvider>
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
