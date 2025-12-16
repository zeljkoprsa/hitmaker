import { useEffect } from 'react';

interface UseMediaSessionProps {
  isPlaying: boolean;
  tempo: number;
  togglePlay: () => void;
  setTempo?: (bpm: number) => void; // Optional: could bind next/prev track to tempo
}

export const useMediaSession = ({
  isPlaying,
  tempo,
  togglePlay,
  setTempo,
}: UseMediaSessionProps) => {
  // Update Metadata
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Hitmaker',
        artist: `${tempo} BPM`,
        album: 'Metronome Practice',
        artwork: [
          { src: '/logo192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo512.png', sizes: '512x512', type: 'image/png' },
        ],
      });
    }
  }, [tempo]);

  // Update Playback State
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Set Action Handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      const handlePlay = () => {
        if (!isPlaying) togglePlay();
      };

      const handlePause = () => {
        if (isPlaying) togglePlay();
      };

      // Play/Pause support
      navigator.mediaSession.setActionHandler('play', handlePlay);
      navigator.mediaSession.setActionHandler('pause', handlePause);
      // 'stop' often maps to pause/reset, but standard is pause for metronome
      navigator.mediaSession.setActionHandler('stop', handlePause);

      // Optional: Tempo Control via Next/Prev Track
      if (setTempo) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          setTempo(Math.max(30, tempo - 5));
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          setTempo(Math.min(500, tempo + 5));
        });
      }

      return () => {
        // Cleanup handlers
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      };
    }
  }, [isPlaying, togglePlay, tempo, setTempo]);
};
