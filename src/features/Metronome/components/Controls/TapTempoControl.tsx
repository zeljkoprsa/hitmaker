import React, { useCallback, useState, useRef } from 'react';

import { useMetronome } from '../../context/MetronomeProvider';

import { TapTempoButton } from './styles';

const TAP_TIMEOUT = 2000; // Clear taps after 2 seconds of inactivity
const MIN_TAPS = 3; // Minimum number of taps before calculating tempo

export const TapTempoControl: React.FC = () => {
  const { setTempo } = useMetronome();
  const [isActive, setIsActive] = useState(false);
  const tapsRef = useRef<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculateTempo = (taps: number[]): number => {
    if (taps.length < 2) return 0;

    // Calculate average time difference between taps
    const intervals = [];
    for (let i = 1; i < taps.length; i++) {
      intervals.push(taps[i] - taps[i - 1]);
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    // Convert to BPM: (1 minute / average interval in ms) * 1000 ms/s * 60 s/min
    return Math.round(60000 / averageInterval);
  };

  const handleTapTempo = useCallback(() => {
    setIsActive(true);
    setTimeout(() => setIsActive(false), 150);

    const now = Date.now();

    // Clear timeout if it exists
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      tapsRef.current = [];
    }, TAP_TIMEOUT);

    // Add new tap
    tapsRef.current = [...tapsRef.current, now];

    // Only keep last 8 taps to avoid growing array indefinitely
    if (tapsRef.current.length > 8) {
      tapsRef.current = tapsRef.current.slice(-8);
    }

    // Calculate and update tempo if we have enough taps
    if (tapsRef.current.length >= MIN_TAPS) {
      const newTempo = calculateTempo(tapsRef.current);
      if (newTempo >= 30 && newTempo <= 500) {
        // Reasonable tempo range
        setTempo(newTempo);
      }
    }
  }, [setTempo]);

  return (
    <TapTempoButton onClick={handleTapTempo} isActive={isActive} aria-label="Tap tempo to set beat">
      {'TAP'.split('').map((char, index, array) => (
        <span key={index} style={{ marginRight: index === array.length - 1 ? 0 : '0.2em' }}>
          {char}
        </span>
      ))}
    </TapTempoButton>
  );
};

export default TapTempoControl;
