import React, { createContext, useCallback, useContext, useState } from 'react';

import { PracticeSession, SessionBlock } from '../core/types/SessionTypes';
import { useMetronome } from '../features/Metronome/context/MetronomeProvider';

import { useToast } from './ToastContext';

const STORAGE_KEY = 'hitmaker_sessions';

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

interface SessionContextType {
  sessions: PracticeSession[];
  createSession: (data: Pick<PracticeSession, 'name' | 'blocks'>) => PracticeSession;
  updateSession: (id: string, data: Pick<PracticeSession, 'name' | 'blocks'>) => void;
  deleteSession: (id: string) => void;
  duplicateSession: (source: PracticeSession) => PracticeSession;
  activeSession: PracticeSession | null;
  currentBlockIndex: number;
  blockStartedAt: Date | null;
  startSession: (session: PracticeSession) => void;
  advanceBlock: () => void;
  endSession: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<PracticeSession[]>(loadSessions);
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [blockStartedAt, setBlockStartedAt] = useState<Date | null>(null);

  const { setTempo, setTimeSignature, setSubdivision } = useMetronome();
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
      setActiveSession(session);
      setCurrentBlockIndex(0);
      applyBlock(session.blocks[0]);
    },
    [applyBlock]
  );

  const advanceBlock = useCallback(() => {
    if (!activeSession) return;
    const nextIndex = currentBlockIndex + 1;
    if (nextIndex >= activeSession.blocks.length) {
      setActiveSession(null);
      setCurrentBlockIndex(0);
      setBlockStartedAt(null);
      showToast('Session complete!', 'success');
      return;
    }
    setCurrentBlockIndex(nextIndex);
    applyBlock(activeSession.blocks[nextIndex]);
  }, [activeSession, currentBlockIndex, applyBlock, showToast]);

  const endSession = useCallback(() => {
    setActiveSession(null);
    setCurrentBlockIndex(0);
    setBlockStartedAt(null);
  }, []);

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
        startSession,
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
