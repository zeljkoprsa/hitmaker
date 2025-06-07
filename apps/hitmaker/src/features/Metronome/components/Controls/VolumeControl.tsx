import React from 'react';

import { useMetronome } from '../../context/MetronomeProvider';

import { VolumeControlContainer, VolumeSlider } from './styles';

export const VolumeControl: React.FC = () => {
  const { volume, setVolume } = useMetronome();

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(event.target.value));
  };

  return (
    <VolumeControlContainer>
      <VolumeSlider
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={handleVolumeChange}
      />
    </VolumeControlContainer>
  );
};

export default VolumeControl;
