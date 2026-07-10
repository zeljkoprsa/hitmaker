import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { PracticeSession, SessionBlock } from '../core/types/SessionTypes';
import { blockAutoAdvances, blockDrivesMetronome } from '../core/utils/sessionBlocks';
import { useMetronome } from '../features/Metronome/context/MetronomeProvider';
import { useSyncedDoc } from '../hooks/useSyncedDoc';
import { supabase } from '../lib/supabase';
import { mergeSessionSets } from '../utils/sessionMerge';

import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const STORAGE_KEY = 'hitmaker_sessions';
const COUNTDOWN_START = 5;

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
  /** Increments each time a session runs to natural completion (all blocks
   *  finished). Manual endSession does NOT count. Lets consumers (Queue)
   *  distinguish completion from abandonment. */
  completionCount: number;
  /** True while signed in but the first sessions pull since sign-in hasn't
   *  completed — sessions from another device may not be visible yet. */
  sessionsSyncPending: boolean;
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
  const {
    data: sessions,
    setData: setSessions,
    initialSyncPending: sessionsSyncPending,
  } = useSyncedDoc<PracticeSession>('sessions', STORAGE_KEY, mergeSessionSets);
  const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [blockStartedAt, setBlockStartedAt] = useState<Date | null>(null);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [completionCount, setCompletionCount] = useState(0);

  const { isPlaying, togglePlay, setTempo, setTimeSignature, setSubdivision } = useMetronome();
  const { showToast } = useToast();
  const { user, cloudSyncEnabled } = useAuth();

  // --- Metronome block application ---

  // Applies a block's metronome settings AND owns the play state: blocks
  // with a tempo start the click, silent blocks (teach/break/free play)
  // stop it — the coach controls the room.
  const applyBlock = useCallback(
    (block: SessionBlock) => {
      if (blockDrivesMetronome(block)) {
        setTempo(block.tempo as number);
        if (block.timeSignature) setTimeSignature(block.timeSignature);
        if (block.subdivision) setSubdivision(block.subdivision);
        if (!isPlaying) togglePlay().catch(() => {});
      } else if (isPlaying) {
        togglePlay().catch(() => {});
      }
      setBlockStartedAt(new Date());
    },
    [setTempo, setTimeSignature, setSubdivision, isPlaying, togglePlay]
  );

  // Countdown tick — fires every second until 0, then starts the block
  // (applyBlock also starts/stops the metronome as the block requires)
  useEffect(() => {
    if (sessionPhase !== 'countdown' || countdown === null) return;
    if (countdown === 0) {
      if (activeSession) applyBlock(activeSession.blocks[currentBlockIndex]);
      setSessionPhase('running');
      setCountdown(null);
      return;
    }
    const id = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(id);
  }, [sessionPhase, countdown, activeSession, currentBlockIndex, applyBlock]);

  // --- CRUD ---

  const createSession = useCallback(
    (data: Pick<PracticeSession, 'name' | 'blocks'>): PracticeSession => {
      const session: PracticeSession = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions(prev => [...prev, session]);
      return session;
    },
    [setSessions]
  );

  const updateSession = useCallback(
    (id: string, data: Pick<PracticeSession, 'name' | 'blocks'>): void => {
      setSessions(prev =>
        prev.map(s => (s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s))
      );
    },
    [setSessions]
  );

  const deleteSession = useCallback(
    (id: string): void => {
      setSessions(prev => prev.filter(s => s.id !== id));
    },
    [setSessions]
  );

  const duplicateSession = useCallback(
    (source: PracticeSession): PracticeSession => {
      const copy: PracticeSession = {
        name: `${source.name} (copy)`,
        blocks: source.blocks.map(b => ({ ...b, id: crypto.randomUUID() })),
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setSessions(prev => [...prev, copy]);
      return copy;
    },
    [setSessions]
  );

  // --- Session runner ---

  const startSession = useCallback(
    (session: PracticeSession) => {
      if (session.blocks.length === 0) return;
      // Apply metronome settings immediately so the drummer can feel the tempo before starting
      const block = session.blocks[0];
      if (block.tempo != null) {
        setTempo(block.tempo);
        if (block.timeSignature) setTimeSignature(block.timeSignature);
        if (block.subdivision) setSubdivision(block.subdivision);
      }
      setActiveSession(session);
      setCurrentBlockIndex(0);
      setBlockStartedAt(null);
      setPausedAt(null);
      setSessionPhase('preview');
    },
    [setTempo, setTimeSignature, setSubdivision]
  );

  const beginSession = useCallback(() => {
    // A count-off before a silent block (stretching, rest) would be noise —
    // only count in when the first block actually runs the click
    const first = activeSession?.blocks[0];
    if (first && !blockDrivesMetronome(first)) {
      applyBlock(first);
      setSessionPhase('running');
      return;
    }
    setSessionPhase('countdown');
    setCountdown(COUNTDOWN_START);
  }, [activeSession, applyBlock]);

  const pauseSession = useCallback(() => {
    if (sessionPhase !== 'running') return;
    if (isPlaying) togglePlay().catch(() => {});
    setPausedAt(Date.now());
    setSessionPhase('paused');
  }, [sessionPhase, isPlaying, togglePlay]);

  const resumeSession = useCallback(() => {
    if (sessionPhase !== 'paused' || pausedAt === null || blockStartedAt === null) return;
    const pauseDuration = Date.now() - pausedAt;
    setBlockStartedAt(new Date(blockStartedAt.getTime() + pauseDuration));
    setPausedAt(null);
    setSessionPhase('running');
    const block = activeSession?.blocks[currentBlockIndex];
    if (!isPlaying && block && blockDrivesMetronome(block)) togglePlay().catch(() => {});
  }, [
    sessionPhase,
    pausedAt,
    blockStartedAt,
    activeSession,
    currentBlockIndex,
    isPlaying,
    togglePlay,
  ]);

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
      if (user && cloudSyncEnabled) {
        const totalDuration = activeSession.blocks.reduce((s, b) => s + b.durationMinutes, 0);
        supabase
          .from('session_history')
          .insert({
            user_id: user.id,
            // Starter/lesson ids aren't UUIDs; the column is UUID-typed
            session_id: activeSession.isStarter || activeSession.guided ? null : activeSession.id,
            session_name: activeSession.name,
            completed_at: new Date().toISOString(),
            blocks_completed: activeSession.blocks.length,
            total_duration_minutes: totalDuration,
          })
          .then(({ error }) => {
            if (error) console.error('Failed to log session history:', error);
          });
      }
      setActiveSession(null);
      setCurrentBlockIndex(0);
      setBlockStartedAt(null);
      setPausedAt(null);
      setSessionPhase('idle');
      setCompletionCount(c => c + 1);
      showToast('Session complete!', 'success');
      return;
    }
    setCurrentBlockIndex(nextIndex);
    setPausedAt(null);
    setSessionPhase('running');
    applyBlock(activeSession.blocks[nextIndex]);
  }, [
    activeSession,
    currentBlockIndex,
    applyBlock,
    isPlaying,
    togglePlay,
    showToast,
    user,
    cloudSyncEnabled,
  ]);

  // Coach auto-advance: typed do/break blocks call time when their clock
  // hits zero. Classic (untyped) blocks keep the overtime display and manual
  // Next — Starters are untouched. Pausing clears the timer; resuming shifts
  // blockStartedAt, so the effect re-arms with the remaining time.
  useEffect(() => {
    if (sessionPhase !== 'running' || !activeSession || !blockStartedAt) return;
    const block = activeSession.blocks[currentBlockIndex];
    if (!blockAutoAdvances(block)) return;
    const endMs = blockStartedAt.getTime() + block.durationMinutes * 60_000;
    const id = setTimeout(() => advanceBlock(), Math.max(0, endMs - Date.now()));
    return () => clearTimeout(id);
  }, [sessionPhase, activeSession, currentBlockIndex, blockStartedAt, advanceBlock]);

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
        completionCount,
        sessionsSyncPending,
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
