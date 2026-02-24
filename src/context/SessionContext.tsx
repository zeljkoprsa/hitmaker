import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { PracticeSession, SessionBlock } from '../core/types/SessionTypes';
import { useMetronome } from '../features/Metronome/context/MetronomeProvider';

import { useToast } from './ToastContext';

const STORAGE_KEY = 'hitmaker_sessions';
const COUNTDOWN_START = 5;

const loadSessions = (): PracticeSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PracticeSession[]) : [];
  } catch {
    return [];
  }
};

const persistSessions = (sessions: PracticeSession[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export type SessionPhase = 'idle' | 'preview' | 'countdown' | 'running' | 'paused';

interface SessionContextType {
  sessions: PracticeSession[];
  createSession: (data: Pick<PracticeSession, 'name' | 'blocks'>) => PracticeSession;
  updateSession: (id: string, data: Pick<PracticeSession, 'name' | 'blocks'>) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (source: PracticeSession) => PracticeSession;
  activeSession: PracticeSession | null;
  currentBlockIndex: number;
  blockStartedAt: Date | null;
  sessionPhase: SessionPhase;
  countdown: number | null;
  startSession: (session: PracticeSession) => void;
  beginSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  restartBlock: () => void;
  advanceBlock: () => void;
  endSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<PracticeSession[]>(loadSessions);
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [blockStartedAt, setBlockStartedAt] = useState<Date | null>(null);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);

  const { isPlaying, togglePlay, setTempo, setTimeSignature, setSubdivision } = useMetronome();
  const { showToast } = useToast();

  const applyBlock = useCallback(
    (block: SessionBlock) => {
      setTempo(block.tempo);
      setTimeSignature(block.timeSignature);
      setSubdivision(block.subdivision);
      setBlockStartedAt(new Date());
    },
    [setTempo, setTimeSignature, setSubdivision]
  );

  // Countdown tick — fires every second until 0, then starts the block and the metronome
  useEffect(() => {
    if (sessionPhase !== 'countdown' || countdown === null) return;
    if (countdown === 0) {
      if (activeSession) applyBlock(activeSession.blocks[currentBlockIndex]);
      if (!isPlaying) togglePlay().catch(() => {});
      setSessionPhase('running');
      setCountdown(null);
      return;
    }
    const id = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [sessionPhase, countdown, activeSession, currentBlockIndex, applyBlock, isPlaying, togglePlay]);

  const createSession = useCallback(
    (data: Pick<PracticeSession, 'name' | 'blocks'>): PracticeSession => {
      const session: PracticeSession = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions(prev => {
        const next = [...prev, session];
        persistSessions(next);
        return next;
      });
      return session;
    },
    []
  );

  const updateSession = useCallback(
    (id: string, data: Pick<PracticeSession, 'name' | 'blocks'>): void => {
      setSessions(prev => {
        const next = prev.map(s =>
          s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
        );
        persistSessions(next);
        return next;
      });
    },
    []
  );

  const deleteSession = useCallback((id: string): void => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      persistSessions(next);
      return next;
    });
  }, []);

  const duplicateSession = useCallback((source: PracticeSession): PracticeSession => {
    const copy: PracticeSession = {
      name: `${source.name} (copy)`,
      blocks: source.blocks.map(b => ({ ...b, id: crypto.randomUUID() })),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions(prev => {
      const next = [...prev, copy];
      persistSessions(next);
      return next;
    });
    return copy;
  }, []);

  const startSession = useCallback(
    (session: PracticeSession) => {
      if (session.blocks.length === 0) return;
      // Apply metronome settings immediately so the drummer can feel the tempo before starting
      const block = session.blocks[0];
      setTempo(block.tempo);
      setTimeSignature(block.timeSignature);
      setSubdivision(block.subdivision);
      setActiveSession(session);
      setCurrentBlockIndex(0);
      setBlockStartedAt(null);
      setPausedAt(null);
      setSessionPhase('preview');
    },
    [setTempo, setTimeSignature, setSubdivision]
  );

  const beginSession = useCallback(() => {
    setSessionPhase('countdown');
    setCountdown(COUNTDOWN_START);
  }, []);

  const pauseSession = useCallback(() => {
    if (sessionPhase !== 'running') return;
    setPausedAt(Date.now());
    setSessionPhase('paused');
  }, [sessionPhase]);

  const resumeSession = useCallback(() => {
    if (sessionPhase !== 'paused' || pausedAt === null || blockStartedAt === null) return;
    const pauseDuration = Date.now() - pausedAt;
    setBlockStartedAt(new Date(blockStartedAt.getTime() + pauseDuration));
    setPausedAt(null);
    setSessionPhase('running');
  }, [sessionPhase, pausedAt, blockStartedAt]);

  const restartBlock = useCallback(() => {
    if (!activeSession) return;
    applyBlock(activeSession.blocks[currentBlockIndex]);
    setPausedAt(null);
    setSessionPhase('running');
  }, [activeSession, currentBlockIndex, applyBlock]);

  const advanceBlock = useCallback(() => {
    if (!activeSession) return;
    const nextIndex = currentBlockIndex + 1;
    if (nextIndex >= activeSession.blocks.length) {
      if (isPlaying) togglePlay().catch(() => {});
      setActiveSession(null);
      setCurrentBlockIndex(0);
      setBlockStartedAt(null);
      setPausedAt(null);
      setSessionPhase('idle');
      showToast('Session complete!', 'success');
      return;
    }
    setCurrentBlockIndex(nextIndex);
    setPausedAt(null);
    setSessionPhase('running');
    applyBlock(activeSession.blocks[nextIndex]);
  }, [activeSession, currentBlockIndex, applyBlock, isPlaying, togglePlay, showToast]);

  const endSession = useCallback(() => {
    if (isPlaying) togglePlay().catch(() => {});
    setActiveSession(null);
    setCurrentBlockIndex(0);
    setBlockStartedAt(null);
    setPausedAt(null);
    setSessionPhase('idle');
    setCountdown(null);
  }, [isPlaying, togglePlay]);

  return (
    <SessionContext.Provider
      value={{
        sessions,
        createSession,
        updateSession,
        deleteSession,
        duplicateSession,
        activeSession,
        currentBlockIndex,
        blockStartedAt,
        sessionPhase,
        countdown,
        startSession,
        beginSession,
        pauseSession,
        resumeSession,
        restartBlock,
        advanceBlock,
        endSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
};
