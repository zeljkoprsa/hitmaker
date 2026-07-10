import React, { useCallback } from 'react';

import { useMetronome } from '@features/Metronome/context/MetronomeProvider';

import { useSession } from '../context/SessionContext';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useMediaSession } from '../hooks/useMediaSession';
import { useWakeLock } from '../hooks/useWakeLock';

/**
 * Playback affordances that must outlive the center-stage swap: keyboard
 * shortcuts, lock-screen media controls, and the screen wake lock used to
 * live inside <Metronome> and died whenever CoachStage took center stage.
 * Mounted once in AppInner; renders nothing.
 */
export const GlobalPlaybackControls: React.FC = () => {
  const { isPlaying, togglePlay, tempo, setTempo } = useMetronome();
  const { sessionPhase, pauseSession, resumeSession } = useSession();

  // During a run, play/pause means pause/resume the session — it owns the
  // click and the block clock, and toggling the raw metronome would desync
  // them. Outside a run it toggles the metronome as before.
  const smartTogglePlay = useCallback(async (): Promise<void> => {
    if (sessionPhase === 'running') {
      pauseSession();
      return;
    }
    if (sessionPhase === 'paused') {
      resumeSession();
      return;
    }
    await togglePlay();
  }, [sessionPhase, pauseSession, resumeSession, togglePlay]);

  // "Something is in progress" — true through silent teach/break blocks,
  // so lock-screen pause works and the screen stays awake for the whole run
  const inProgress = isPlaying || sessionPhase === 'running';

  useWakeLock(isPlaying || sessionPhase !== 'idle');
  useKeyboardShortcuts({ togglePlay: smartTogglePlay, tempo, setTempo });
  useMediaSession({ isPlaying: inProgress, tempo, togglePlay: smartTogglePlay, setTempo });

  return null;
};

export default GlobalPlaybackControls;
