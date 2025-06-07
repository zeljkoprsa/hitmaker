# Sample Playback Implementation Plan (Simplified)

This document outlines the implementation of audio sample playback capabilities in the metronome application. The application has been simplified to use only sample-based sounds, removing the synthesized sound option for a more consistent user experience.

## Current Architecture Overview

Our current architecture has several strengths that make it well-suited for this extension:

1. **Separation of Concerns**: 
   - Metronome Engine (timing logic)
   - Output Sources (sound generation)
   - UI Components (user interaction)

2. **Interface-Based Design**:
   - `IOutputSource` interface allows for multiple implementations
   - `BaseOutputSource` provides common functionality
   - `SampleAudioSource` implements sample-based sounds

3. **Registry Pattern**:
   - `OutputSourceRegistry` manages the lifecycle of output sources
   - Allows for dynamic creation and switching between sources

## Implementation Goals

1. Provide a small selection of high-quality sample-based sound options
2. Support high/low sounds for accented/regular beats
3. Maintain precise timing and low latency, especially on mobile devices
4. Create a simple, intuitive sound selection UI consistent with existing controls
5. Simplify the codebase by using a single approach for sound playback

## Implementation Components

### 1. Sound Registry

Create a registry of available sample-based sounds with metadata:

```typescript
interface Sound {
  id: string;
  name: string;
  type: 'sample';
  category: 'percussion' | 'electronic';
  description?: string;
  highSample: string; // Path to high sample
  lowSample: string;  // Path to low sample
}

const SOUNDS: Sound[] = [
  // High-quality sample sets
  {
    id: 'metronome-quartz',
    name: 'Metronome Quartz',
    type: 'sample',
    category: 'percussion',
    description: 'Traditional mechanical metronome sound',
    highSample: '/assets/sounds/Perc_MetronomeQuartz_hi.wav',
    lowSample: '/assets/sounds/Perc_MetronomeQuartz_lo.wav'
  },
  {
    id: 'electronic-click',
    name: 'Electronic Click',
    type: 'sample',
    category: 'electronic',
    description: 'Clean electronic click sound',
    highSample: '/assets/sounds/Synth_Tick_A_hi.wav',
    lowSample: '/assets/sounds/Synth_Tick_A_lo.wav'
  },
  {
    id: 'digital-bell',
    name: 'Digital Bell',
    type: 'sample',
    category: 'electronic',
    description: 'Bright digital bell sound',
    highSample: '/assets/sounds/Synth_Bell_A_hi.wav',
    lowSample: '/assets/sounds/Synth_Bell_A_lo.wav'
  }
];
```

### 2. SampleAudioSource Class

Create a new implementation of `BaseOutputSource` that loads and plays audio samples with performance optimization for mobile:

```typescript
export class SampleAudioSource extends BaseOutputSource {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private sampleBuffers: Map<string, AudioBuffer> = new Map();
  private currentSoundId: string = 'metronome-quartz';
  private isLoading: boolean = false;
  
  // Methods:
  // - loadSample(url: string): Promise<AudioBuffer>
  // - setSound(soundId: string): Promise<void>
  // - playClick(time: number, isAccented: boolean): void
  // - getLoadingStatus(): boolean
  // - preloadSamples(): Promise<void> // Preload the current sound set
  // - optimizeForMobile(): void // Reduce buffer size for mobile if needed
}
```

### 3. Extended Metronome Configuration

Update the metronome configuration to include sound options with a simplified approach:

```typescript
interface MetronomeConfig {
  // Existing properties...
  soundId: string; // ID of the selected sound (synthesized or sample)
}
```

### 4. Sound Selector UI Component
};
```

### 4. Integration with MetronomeProvider

Simplified the MetronomeProvider to always use SampleAudioSource for sound playback:

```typescript
// In MetronomeProvider
const [soundId, setSoundIdState] = useState(() => {
  // Try to load from localStorage or use default
  const savedSound = localStorage.getItem('metrodome-sound-preference');
  return savedSound || 'metronome-quartz';
});

// Method to switch sounds
const setSound = async (newSoundId: string) => {
  try {
    setIsLoadingSound(true);
    const registry = outputRegistryRef.current;
    if (!registry) return;

    console.log(`MetronomeProvider: Setting sound to ${newSoundId}`);

    const sound = getSoundById(newSoundId);
    if (!sound) {
      console.error(`MetronomeProvider: Sound with ID ${newSoundId} not found`);
      return;
    }

    // Get or create SampleAudioSource
    console.log('MetronomeProvider: Using SampleAudioSource');
    let sampleSource = registry.getSource('sample') as SampleAudioSource;
    
    if (!sampleSource) {
      // Create new SampleAudioSource if it doesn't exist
      sampleSource = new SampleAudioSource({
        id: 'sample',
        type: 'sample',
        enabled: true,
        options: { volume, muted, soundId: newSoundId }
      });

      // Initialize the SampleAudioSource before registering it
      await sampleSource.initialize({
        id: 'sample',
        type: 'sample',
        enabled: true,
        options: { volume, muted, soundId: newSoundId }
      });

      await registry.createSource('sample', sampleSource);
    }
    
    // Set the new sound and activate the source
    await sampleSource.setSound(newSoundId);
    registry.setActiveSource('sample');
    
    // Update state and save preference
    setSoundIdState(newSoundId);
    localStorage.setItem('metrodome-sound-preference', newSoundId);
  } catch (error) {
    console.error('Error setting sound:', error);
  } finally {
    setIsLoadingSound(false);
  }
};
```

## Implementation Steps (MLP Focus)

### Phase 1: Core Functionality

1. **Create Sound Registry**:
   - Define the unified `Sound` interface for sample-based sounds
   - Create the `SOUNDS` constant with metadata for the limited initial sound options
   - Prepare the 2-3 high-quality sample files

2. **Implement SampleAudioSource**:
   - Create the class extending `BaseOutputSource`
   - Implement sample loading with mobile optimization
   - Add methods for playing samples with precise timing
   - Support volume control and muting

3. **Update OutputSourceRegistry**:
   - Add support for creating and managing a `SampleAudioSource`
   - Implement seamless switching between different audio sources

### Phase 2: UI Integration

4. **Update MetronomeProvider**:
   - Add simplified sound configuration to the context
   - Implement method for changing sounds
   - Add persistence using localStorage

5. **Create Sound Selector UI**:
   - Build a simple UI component following existing UI patterns
   - Include loading indicator for sample loading
   - Ensure mobile-friendly interaction

6. **Integrate with Metronome UI**:
   - Add the Sound Selector to the Metronome component
   - Ensure consistent styling with other controls

### Phase 3: Testing & Optimization

7. **Performance Testing**:
   - Test timing accuracy with different sound options
   - Verify performance on mobile devices
   - Optimize sample loading and playback as needed

8. **Cross-Browser Validation**:
   - Test in Chrome, Safari, Firefox, and Edge
   - Ensure consistent behavior across platforms
   - Verify mobile browser compatibility

## Technical Considerations (MLP Focus)

### Sample Loading Strategy

1. **Efficient Preloading**:
   - Preload only the currently selected sound on initialization
   - Implement a simple loading indicator during sample loading

2. **Mobile Optimization**:
   - Detect mobile devices and optimize buffer sizes if needed
   - Implement memory-efficient caching strategy for mobile

### Audio Processing

1. **Minimal Processing**:
   - Use pre-normalized samples to minimize runtime processing
   - Apply only essential gain control for volume adjustment

2. **Timing Precision**:
   - Maintain the same precise timing logic as the synthesized sounds
   - Ensure consistent latency between all sound options

### User Experience

1. **Simple Selection**:
   - Focus on a clean, simple selection UI consistent with existing controls
   - Avoid complex categorization for the limited initial sound options

2. **Persistence**:
   - Save user's sound preference to localStorage
   - Restore preference on application load

## Future Enhancements (Post-MLP)

1. **Expanded Sound Library**:
   - Add more sample sets in various categories
   - Implement more advanced sound browsing UI

2. **Custom Sample Upload**:
   - Allow users to upload their own samples
   - Implement sample processing for uploaded files

3. **Advanced Sound Options**:
   - Add pitch shifting and envelope shaping
   - Support different samples for different subdivisions

## Conclusion

This refined implementation plan provides a focused roadmap for adding audio sample playback to the metronome application as a Minimum Lovable Product. By limiting the initial scope to 2-3 high-quality sound options and simplifying the UI approach, we can deliver a valuable enhancement while maintaining the lean, performance-focused nature of the application. The architecture remains extensible for future enhancements after the MLP is successfully delivered.
