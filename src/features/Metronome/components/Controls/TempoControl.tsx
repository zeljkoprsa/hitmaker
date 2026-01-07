import styled from '@emotion/styled';
import {
  motion,
  useMotionValue,
  useSpring,
  animate,
  AnimationPlaybackControls,
} from 'framer-motion';
import React, { useCallback, useRef } from 'react';

// Constants for visual and interaction settings
const GRID_LINE_SPACING = 10; // Pixels between grid lines
const GRID_LINE_COUNT = 404; // Total number of lines (should be odd for center alignment)
const CENTER_INDEX = Math.floor(GRID_LINE_COUNT / 2);

// Tempo and movement constants
const MIN_TEMPO = 40;
const MAX_TEMPO = 500;
const BASE_PIXELS_PER_BPM = 4; // Base pixels per BPM for slow movements
const ELASTICITY = 0.3; // How much movement to allow beyond limits (30%)

// Non-linear mapping constants
const TEMPO_BREAKPOINTS = [60, 120, 240, 360, 500]; // Tempo breakpoints for non-linear mapping
const SENSITIVITY_FACTORS = [1.0, 0.8, 0.5, 0.3, 0.2]; // Sensitivity factors for each range

// Velocity-based acceleration constants
const MIN_VELOCITY = 0.1; // Minimum velocity to consider (pixels/ms)
const MAX_VELOCITY = 5.0; // Maximum velocity to consider (pixels/ms)
const MAX_ACCELERATION_FACTOR = 3.0; // Maximum acceleration factor
const INERTIA_THRESHOLD = 0.1; // Minimum velocity to trigger inertia

const SPRING_CONFIG = {
  // Animation type for natural movement
  type: 'spring',
  // Higher stiffness = faster spring movement (like a tighter spring)
  stiffness: 400,
  // Higher damping = less oscillation (prevents excessive bouncing)
  damping: 30,
  // Lower mass = more responsive movement (affects momentum)
  mass: 0.5,
};

// Styled components for visual elements
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
  touch-action: none; // Prevent scroll/zoom on touch devices
  user-select: none; // Prevent text selection during drag
  border-radius: var(--border-radius-xs) var(--border-radius-xs) 55px 55px;
`;

const GridContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 50%;
  width: 100%;
  height: 100%;
`;

const GridLine = styled.div<{ isCenter?: boolean }>`
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: ${props => (props.isCenter ? '#ffffff' : '#ffffff33')};
  transform: translateX(-50%);
`;

const CenterLine = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.metronome.accent};
  transform: translateX(-50%);
  z-index: 2;
`;

interface TempoControlProps {
  tempo: number;
  setTempo: (newTempo: number) => void;
}

export const TempoControl: React.FC<TempoControlProps> = ({ tempo, setTempo }) => {
  // Motion value for grid position
  const position = useMotionValue(0);

  // Refs for tracking drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startPosition = useRef(0);
  const startTempo = useRef(tempo);

  // Animation control ref
  const animationRef = useRef<AnimationPlaybackControls | null>(null);

  // Refs for velocity tracking
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  // Get sensitivity factor based on current tempo
  const getSensitivityFactor = useCallback((currentTempo: number) => {
    // Find the appropriate sensitivity factor based on tempo breakpoints
    for (let i = 0; i < TEMPO_BREAKPOINTS.length; i++) {
      if (currentTempo <= TEMPO_BREAKPOINTS[i]) {
        if (i === 0) return SENSITIVITY_FACTORS[0];

        // Interpolate between breakpoints for smooth transition
        const prevBreakpoint = TEMPO_BREAKPOINTS[i - 1];
        const nextBreakpoint = TEMPO_BREAKPOINTS[i];
        const prevFactor = SENSITIVITY_FACTORS[i - 1];
        const nextFactor = SENSITIVITY_FACTORS[i];

        const t = (currentTempo - prevBreakpoint) / (nextBreakpoint - prevBreakpoint);
        return prevFactor + t * (nextFactor - prevFactor);
      }
    }
    return SENSITIVITY_FACTORS[SENSITIVITY_FACTORS.length - 1];
  }, []);

  // Get acceleration factor based on velocity
  const getAccelerationFactor = useCallback((velocityValue: number) => {
    // Calculate absolute velocity and clamp it
    const absVelocity = Math.abs(velocityValue);
    const clampedVelocity = Math.min(Math.max(absVelocity, MIN_VELOCITY), MAX_VELOCITY);

    // Map velocity to acceleration factor (1.0 to MAX_ACCELERATION_FACTOR)
    const t = (clampedVelocity - MIN_VELOCITY) / (MAX_VELOCITY - MIN_VELOCITY);
    return 1.0 + t * (MAX_ACCELERATION_FACTOR - 1.0);
  }, []);

  // Convert position to tempo using non-linear mapping
  const positionToTempo = useCallback(
    (position: number) => {
      // Start from the initial tempo
      let currentTempo = startTempo.current;
      let remainingPosition = position;
      const direction = Math.sign(remainingPosition);
      remainingPosition = Math.abs(remainingPosition);

      // Incrementally calculate tempo changes based on position
      while (remainingPosition > 0.1) {
        // Get current sensitivity and calculate pixels per BPM
        const sensitivity = getSensitivityFactor(currentTempo);
        const pixelsPerBpm = BASE_PIXELS_PER_BPM / sensitivity;

        // Calculate how much tempo we can change with remaining position
        const tempoChange = Math.min(1, remainingPosition / pixelsPerBpm);

        // Update tempo and remaining position
        currentTempo += tempoChange * direction;
        remainingPosition -= tempoChange * pixelsPerBpm;

        // Ensure we stay within bounds
        if (
          (direction > 0 && currentTempo >= MAX_TEMPO) ||
          (direction < 0 && currentTempo <= MIN_TEMPO)
        ) {
          break;
        }
      }

      return Math.round(Math.min(Math.max(currentTempo, MIN_TEMPO), MAX_TEMPO));
    },
    [getSensitivityFactor]
  );

  // Convert tempo to position (approximate inverse of positionToTempo)
  const tempoToPosition = useCallback(
    (targetTempo: number) => {
      // Simple approximation - this works well enough for snapping animations
      const tempoDiff = targetTempo - startTempo.current;
      const avgSensitivity =
        (getSensitivityFactor(startTempo.current) + getSensitivityFactor(targetTempo)) / 2;
      return tempoDiff * (BASE_PIXELS_PER_BPM / avgSensitivity);
    },
    [getSensitivityFactor]
  );

  // Calculate elastic position with boundaries
  const calculateElasticPosition = useCallback(
    (rawPosition: number) => {
      const minOffset = tempoToPosition(MIN_TEMPO);
      const maxOffset = tempoToPosition(MAX_TEMPO);

      const minPosition = startPosition.current + minOffset;
      const maxPosition = startPosition.current + maxOffset;

      if (rawPosition < minPosition) {
        const overshoot = minPosition - rawPosition;
        return minPosition - overshoot * ELASTICITY;
      }

      if (rawPosition > maxPosition) {
        const overshoot = rawPosition - maxPosition;
        return maxPosition + overshoot * ELASTICITY;
      }

      return rawPosition;
    },
    [tempoToPosition]
  );

  // Snap position back to valid tempo range with spring animation
  const snapToValidRange = useCallback(() => {
    const currentPosition = position.get();
    // Calculate tempo based on delta from startPosition (assuming startPosition was valid for startTempo)
    // Note: This heuristic might be slightly off if snap is called outside a drag context where startPosition is stale.
    // However, snapToValidRange is primarily for drag cancel/end.
    // To be safe, we can recalculate:

    // Actually, for snap, we just want to ensure we aren't out of bounds.
    // If we're out of bounds, snap to the bound.

    // We can check the current projected tempo using the last known start reference
    const delta = currentPosition - startPosition.current;
    const currentTempo = positionToTempo(delta);

    if (currentTempo < MIN_TEMPO) {
      const minOffset = tempoToPosition(MIN_TEMPO);
      position.set(startPosition.current + minOffset);
      setTempo(MIN_TEMPO);
    } else if (currentTempo > MAX_TEMPO) {
      const maxOffset = tempoToPosition(MAX_TEMPO);
      position.set(startPosition.current + maxOffset);
      setTempo(MAX_TEMPO);
    } else {
      setTempo(Math.round(currentTempo));
    }
  }, [position, setTempo, tempoToPosition, positionToTempo]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      // Stop any active animation
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }

      isDragging.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      startX.current = event.clientX;
      startPosition.current = position.get();
      startTempo.current = tempo;

      // Reset velocity tracking
      lastX.current = event.clientX;
      lastTime.current = performance.now();
      velocity.current = 0;
    },
    [position, tempo]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging.current) return;

      // Calculate velocity
      const now = performance.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        const dx = event.clientX - lastX.current;
        velocity.current = dx / dt; // pixels per millisecond
      }
      lastX.current = event.clientX;
      lastTime.current = now;

      // Get acceleration factor based on velocity
      const accelerationFactor = getAccelerationFactor(velocity.current);

      // Calculate raw position based on drag, but reverse the direction
      // Apply acceleration factor to make faster movements have more effect
      const deltaX = -(event.clientX - startX.current) * accelerationFactor;
      const rawPosition = startPosition.current + deltaX;

      // Apply elastic effect if beyond limits
      const elasticPosition = calculateElasticPosition(rawPosition);
      position.set(elasticPosition);

      // Update tempo based on position delta
      const deltaFromStart = elasticPosition - startPosition.current;
      const newTempo = positionToTempo(deltaFromStart);
      setTempo(newTempo);

      // Debug info
      // console.log(`Velocity: ${ velocity.current.toFixed(2) } px / ms, Acceleration: ${ accelerationFactor.toFixed(2) } x, Tempo: ${ newTempo } `);
    },
    [setTempo, position, calculateElasticPosition, positionToTempo, getAccelerationFactor]
  );

  const handlePointerUp = useCallback(
    (_event: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      // Check if we should trigger inertia
      if (Math.abs(velocity.current) > INERTIA_THRESHOLD) {
        // Reverse velocity because drag direction is inverted relative to value
        // Note: loop velocity is px/ms, amplify it for inertia feel
        const inertiaVelocity = -velocity.current * 1000; // px/sec

        const minOffset = tempoToPosition(MIN_TEMPO);
        const maxOffset = tempoToPosition(MAX_TEMPO);
        const min = startPosition.current + minOffset;
        const max = startPosition.current + maxOffset;

        animationRef.current = animate(position, position.get(), {
          type: 'inertia',
          velocity: inertiaVelocity,
          min,
          max,
          power: 0.1, // Friction/Momentum power
          timeConstant: 300, // Deceleration curve
          onUpdate: v => {
            const delta = v - startPosition.current;
            const t = positionToTempo(delta);
            setTempo(t);
          },
        });
      } else {
        // Normal stop behavior
        const currentPosition = position.get();
        const elasticPosition = calculateElasticPosition(currentPosition);
        position.set(elasticPosition);

        const deltaFromStart = elasticPosition - startPosition.current;
        const newTempo = Math.round(
          Math.min(MAX_TEMPO, Math.max(MIN_TEMPO, positionToTempo(deltaFromStart)))
        );
        setTempo(newTempo);
      }
    },
    [setTempo, position, calculateElasticPosition, positionToTempo, tempoToPosition]
  );

  const handlePointerCancel = useCallback(
    (event: React.PointerEvent) => {
      if (!isDragging.current) return;

      // Release pointer capture and reset state
      event.currentTarget.releasePointerCapture(event.pointerId);
      isDragging.current = false;

      // Snap back to valid range
      snapToValidRange();
    },
    [snapToValidRange]
  );

  // Generate grid lines with absolute pixel positioning
  const gridLines = Array.from({ length: GRID_LINE_COUNT }, (_, index) => {
    const offset = (index - CENTER_INDEX) * GRID_LINE_SPACING;
    return (
      <GridLine
        key={index}
        style={{
          left: `calc(50% + ${offset}px)`,
          opacity: index % 4 === 0 ? 0.4 : 0.2, // Stronger opacity every 4th line
        }}
      />
    );
  });

  return (
    <Container
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
    >
      <GridContainer style={{ x: useSpring(position, SPRING_CONFIG) }}>{gridLines}</GridContainer>
      <CenterLine />
    </Container>
  );
};
