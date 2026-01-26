import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { flex, transition } from '../../../../../shared/styles/mixins';

export const SoundSelectorContainer = styled.div`
  position: relative;
  display: flex;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
`;

export const DropdownPanel = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 90%;
  max-width: 500px;
  max-height: 70vh;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border: ${({ theme }) => theme.borders.width.thin} solid ${({ theme }) => `${theme.colors.text.primary}1A`};
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  backdrop-filter: blur(20px);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: ${({ theme }) => theme.spacing.md};
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => `${theme.colors.text.primary}0D`};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => `${theme.colors.text.primary}33`};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => `${theme.colors.text.primary}4D`};
  }
`;

export const SoundGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface SoundCardProps {
  isSelected: boolean;
}

export const SoundCard = styled(motion.button)<SoundCardProps>`
  position: relative;
  ${flex({ direction: 'column', align: 'flex-start', gap: 'sm' })}
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.metronome.midBackground : `${theme.colors.text.primary}08`};
  border: ${({ theme, isSelected }) =>
    `${theme.borders.width.thin} solid ${
      isSelected ? theme.colors.metronome.accent : `${theme.colors.text.primary}14`
    }`};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  ${transition({ properties: ['background-color', 'border-color'], speed: 'fast' })}

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected ? theme.colors.metronome.midBackground : `${theme.colors.text.primary}0F`};
    border-color: ${({ theme, isSelected }) =>
      isSelected ? theme.colors.metronome.accent : `${theme.colors.text.primary}26`};
  }

  &:hover button {
    opacity: 1;
    transform: scale(1);
  }

  ${({ isSelected, theme }) =>
    isSelected &&
    `
    box-shadow: 0 0 0 ${theme.borders.width.thin} ${theme.colors.metronome.accent}40,
                ${theme.shadows.md};
  `}
`;

export const CheckIcon = styled(motion.div)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: ${({ theme }) => theme.spacing.xl};
  height: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.metronome.accent};
  border-radius: ${({ theme }) => theme.borders.radius.round};
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  ${flex({ justify: 'center', align: 'center' })}
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

interface PreviewButtonProps {
  isPreviewing: boolean;
}

export const PreviewButton = styled.button<PreviewButtonProps>`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: ${({ theme }) => theme.spacing.xxl};
  height: ${({ theme }) => theme.spacing.xxl};
  background-color: ${({ theme, isPreviewing }) =>
    isPreviewing ? theme.colors.metronome.accent : `${theme.colors.text.primary}1A`};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.round};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  ${flex({ justify: 'center', align: 'center' })}
  ${transition({ properties: ['background-color', 'transform', 'opacity'], speed: 'fast' })}
  opacity: 0;
  transform: scale(0.9);

  &:hover {
    background-color: ${({ theme }) => theme.colors.metronome.accent};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

interface PlayIconProps {
  isPreviewing: boolean;
}

export const PlayIcon = styled.span<PlayIconProps>`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  line-height: 1;
  margin-left: ${({ theme }) => theme.spacing.xs};
  ${transition({ properties: 'transform', speed: 'fast' })}

  ${({ isPreviewing }) =>
    isPreviewing &&
    `
    transform: scale(1.2);
  `}
`;

export const SoundName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
`;
