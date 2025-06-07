import { useCallback, useRef } from 'react';

const useTapTempo = ({ setTempo }: { setTempo: (tempo: number) => void }) => {
  const lastTapTimeRef = useRef<number>(0);
  const tapTempoBufferRef = useRef<number[]>([]);

  const tapTempo = useCallback(() => {
    const now = performance.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;
    lastTapTimeRef.current = now;

    // Reset if more than 2 seconds have passed
    if (timeSinceLastTap > 2000) {
      tapTempoBufferRef.current = [];
      return;
    }

    // Add the new interval to the buffer
    tapTempoBufferRef.current.push(timeSinceLastTap);

    // Keep only the last 4 taps
    if (tapTempoBufferRef.current.length > 4) {
      tapTempoBufferRef.current.shift();
    }

    // Calculate new tempo if we have at least 2 taps
    if (tapTempoBufferRef.current.length >= 2) {
      const averageInterval =
        tapTempoBufferRef.current.reduce((a, b) => a + b, 0) / tapTempoBufferRef.current.length;
      const newTempo = Math.round(60000 / averageInterval); // Convert to BPM

      // Clamp tempo between 20 and 400 BPM
      const clampedTempo = Math.min(Math.max(newTempo, 20), 400);
      setTempo(clampedTempo);
    }
  }, [setTempo]);

  return { tapTempo };
};

export default useTapTempo;
