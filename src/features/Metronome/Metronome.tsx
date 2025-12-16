// src/features/Metronome/Metronome.tsx

import { useEffect, useState } from 'react';

import { ITickEvent } from '../../core/interfaces/ITickEvent';
import { useMediaSession } from '../../hooks/useMediaSession';
import { useResponsive } from '../../hooks/useResponsive';
import { useWakeLock } from '../../hooks/useWakeLock';

import { Controls, Displays } from './components';
import { SoundSelector } from './components/Controls/SoundSelector';
import { useMetronome } from './context/MetronomeProvider';
import styles from './styles.module.css';

const Metronome: React.FC = () => {
  const { isMobile: _isMobile } = useResponsive();
  const [currentBeat, setCurrentBeat] = useState(0);

  // Destructure state and functions from the metronome context
  const {
    tempo,
    setTempo,
    isPlaying,
    togglePlay,
    timeSignature,
    setTimeSignature,
    subdivision,
    setSubdivision,
    soundId,
    isLoadingSound,
    setSound,
    onTick,
    accents,
    toggleAccent,
  } = useMetronome();

  // Enable Screen Wake Lock while playing
  useWakeLock(isPlaying);

  // Enable Media Session controls (Lock Screen Play/Pause + Next/Prev for Tempo)
  useMediaSession({ isPlaying, tempo, togglePlay, setTempo });

  // Listen to beat events
  useEffect(() => {
    const handleTick = (event: ITickEvent) => {
      // Only update on main beats, not subdivisions
      if (Number.isInteger(event.beatNumber)) {
        setCurrentBeat(event.beatNumber - 1); // Convert 1-based to 0-based
      }
    };

    const unsubscribe = onTick(handleTick);
    return () => {
      unsubscribe();
    };
  }, [onTick]);

  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <div className={styles.controls}>
          {/* Visualize current beat within the time signature */}
          <div className={styles.beatVisualizer}>
            <Displays.BeatVisualizer
              timeSignature={timeSignature}
              currentBeat={currentBeat}
              accents={accents}
              onToggleAccent={toggleAccent}
            />
          </div>

          {/* Playback controls group */}
          <div className={styles.playbackControls}>
            <div className={styles.startStopControl}>
              <Controls.StartStopButton isPlaying={isPlaying} togglePlay={togglePlay} />
            </div>
            <div className={styles.tapTempoControl}>
              <Controls.TapTempoControl />
            </div>
          </div>

          {/* Tempo section with adjacent controls */}
          <div className={styles.tempoSection}>
            <div className={styles.timeSignatureControl}>
              <Controls.TimeSignatureControl
                timeSignature={timeSignature}
                changeTimeSignature={(beats, noteValue) => {
                  setTimeSignature({ beats, noteValue });
                }}
              />
            </div>
            <div className={styles.tempoDisplay}>
              <Controls.TempoDisplay />
            </div>
            <div className={styles.subdivisionControl}>
              <Controls.SubdivisionControl
                subdivision={subdivision}
                changeSubdivision={setSubdivision}
              />
            </div>
          </div>

          {/* Accent control */}
          <Controls.AccentControl accents={accents || []} onToggleAccent={toggleAccent} />

          {/* Tempo slider */}
          <div className={styles.tempoSlider}>
            <Controls.TempoControl tempo={tempo} setTempo={setTempo} />
          </div>

          {/* Sound selector */}
          <div className={styles.soundSelector}>
            <SoundSelector
              currentSoundId={soundId}
              onSoundChange={setSound}
              isLoading={isLoadingSound}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * The main component for the Metronome feature, which includes controls for
 * starting/stopping the metronome, adjusting the tempo, changing the time signature,
 * and controlling subdivisions. It also displays the current tempo, time signature,
 * and beat visualizer.
 */
export default Metronome;
