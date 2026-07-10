import { useEffect, useState } from 'react';

import { useSession } from '../context/SessionContext';

/**
 * Seconds remaining in the current block (negative = overtime). Ticks once a
 * second while the run is in the running phase and freezes while paused —
 * the single clock shared by the runner bar and the coach stage.
 */
export function useBlockRemaining(): number | null {
  const { activeSession, currentBlockIndex, blockStartedAt, sessionPhase } = useSession();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!blockStartedAt || sessionPhase !== 'running') return;
    const tick = () => setElapsed(Math.floor((Date.now() - blockStartedAt.getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [blockStartedAt, sessionPhase]);

  if (!activeSession) return null;
  const block = activeSession.blocks[currentBlockIndex];
  return Math.round(block.durationMinutes * 60) - elapsed;
}

export const formatBlockTime = (seconds: number): string => {
  const m = Math.floor(Math.abs(seconds) / 60);
  const s = Math.abs(seconds) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};
