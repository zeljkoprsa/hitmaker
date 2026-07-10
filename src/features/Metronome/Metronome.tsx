// src/features/Metronome/Metronome.tsx

import { useEffect, useState } from 'react';

import { TempoTrainerMode } from '../../components/TempoTrainer';
import { ITickEvent } from '../../core/interfaces/ITickEvent';
import { useResponsive } from '../../hooks/useResponsive';

import { Controls, Displays } from './components';
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
    onTick,
    accents,
    toggleAccent,
    setAccents,
  } = useMetronome();

  // Wake lock, keyboard shortcuts, and media-session controls live in
  // GlobalPlaybackControls (AppInner) so they survive guided runs, when
  // this component leaves center stage.

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

          {/* Accent pattern presets - positioned right below visualizer */}
          <Controls.AccentControl
            accents={accents || []}
            timeSignature={timeSignature}
            onApplyPreset={setAccents}
          />

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

          {/* Tempo slider */}
          <div className={styles.tempoSlider}>
            <Controls.TempoControl tempo={tempo} setTempo={setTempo} />
          </div>

          {/* Tempo Trainer mode launcher */}
          <TempoTrainerMode />
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
