# Tempo Range Extension Plan (30-500 BPM)

This document outlines the plan to extend the metronome's tempo range from the current 30-300 BPM to 30-500 BPM.

## Code Changes Required

### Core Engine

1. **Metronome.ts**:
   - Update class documentation comment that specifies tempo range
   - Modify the `setTempo` method to use 500 instead of 300 as the upper limit:
     ```typescript
     const clampedBpm = Math.max(30, Math.min(500, bpm));
     ```

### UI Components

1. **TapTempoControl.tsx**:
   - Update tempo validation check:
     ```typescript
     if (newTempo >= 30 && newTempo <= 500) {
       // Valid tempo range
       setTempo(newTempo);
     }
     ```

2. **TempoDisplay.tsx**:
   - Change the `MAX_TEMPO` constant from 240 to 500

3. **TempoControl.tsx**:
   - Update the `MAX_TEMPO` constant from 220 to 500
   - Consider adjusting `PIXELS_PER_BPM` for better slider sensitivity at higher tempos

### Documentation Updates

1. **metronome-architecture.md**:
   - Update "Full Tempo Range" feature mention to "Supports 30-500 BPM"

2. **tech-notes.md**:
   - Update tempo range mention to "(30-500 BPM)"

## Testing Plan

1. **Functional Testing**:
   - Verify metronome operates correctly at various tempos (30, 100, 300, 400, 500 BPM)
   - Test tempo changes during playback
   - Ensure subdivision playback works correctly at high tempos

2. **Performance Testing**:
   - Measure CPU usage at high tempos (300-500 BPM)
   - Check for audio glitches or timing issues
   - Test on mobile devices to ensure performance is acceptable

3. **UI Testing**:
   - Verify tempo slider behavior across the full range
   - Ensure tempo display updates correctly
   - Test tap tempo functionality with very fast tapping

## Considerations

1. **Audio Scheduling**:
   - At 500 BPM, beats occur every 120ms
   - Ensure the scheduling lookahead window is appropriate for very fast tempos

2. **User Experience**:
   - Consider adding visual feedback for extremely fast tempos
   - Evaluate if UI controls remain usable at extreme tempos

3. **Mobile Performance**:
   - Monitor battery usage and performance on mobile devices
   - Implement optimizations if needed for high-tempo playback on mobile

## Implementation Priority

1. Core engine changes
2. UI component updates
3. Testing at high tempos
4. Documentation updates
5. Performance optimizations (if needed)
