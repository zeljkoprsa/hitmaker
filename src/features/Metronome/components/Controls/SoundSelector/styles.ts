import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { flex, transition } from '../../../../../shared/styles/mixins';

export const SoundSelectorContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
`;

interface SoundButtonProps {
  isOpen: boolean;
}

export const SoundButton = styled.button<SoundButtonProps>`
  ${flex({ direction: 'row', align: 'center', gap: 'md' })}
  min-width: 200px;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border: ${({ theme }) => theme.borders.width.thin} solid
    ${({ theme, isOpen }) => (isOpen ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.1)')};
  border-radius: ${({ theme }) => theme.borders.radius.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  ${transition({ properties: ['border-color', 'background-color', 'transform'], speed: 'fast' })}

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.metronome.midBackground};
    border-color: ${({ theme, isOpen }) =>
      isOpen ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.2)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SoundIcon = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xl};
  line-height: 1;
`;

export const SoundLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  text-transform: capitalize;
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
  border: ${({ theme }) => theme.borders.width.thin} solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  backdrop-filter: blur(20px);

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

export const CategorySection = styled.div`
  ${flex({ direction: 'column', gap: 'md' })}

  &:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.spacing.xl};
    padding-bottom: ${({ theme }) => theme.spacing.lg};
    border-bottom: ${({ theme }) => theme.borders.width.thin} solid rgba(255, 255, 255, 0.05);
  }
`;

export const CategoryHeader = styled.div`
  ${flex({ direction: 'row', align: 'center', gap: 'sm' })}
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;

  span:first-of-type {
    font-size: ${({ theme }) => theme.typography.fontSizes.md};
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
    isSelected ? theme.colors.metronome.midBackground : 'rgba(255, 255, 255, 0.03)'};
  border: ${({ theme, isSelected }) =>
    `${theme.borders.width.thin} solid ${
      isSelected ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.08)'
    }`};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  ${transition({ properties: ['background-color', 'border-color'], speed: 'fast' })}

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      isSelected ? theme.colors.metronome.midBackground : 'rgba(255, 255, 255, 0.06)'};
    border-color: ${({ theme, isSelected }) =>
      isSelected ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.15)'};
  }

  &:hover button {
    opacity: 1;
    transform: scale(1);
  }

  ${({ isSelected, theme }) =>
    isSelected &&
    `
    box-shadow: 0 0 0 1px ${theme.colors.metronome.accent}40,
                0 4px 12px ${theme.colors.metronome.accent}20;
  `}
`;

export const CheckIcon = styled(motion.div)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 20px;
  height: 20px;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.metronome.accent} 0%,
    #d63a04 100%
  );
  border-radius: ${({ theme }) => theme.borders.radius.round};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  ${flex({ justify: 'center', align: 'center' })}
  box-shadow: 0 2px 8px ${({ theme }) => theme.colors.metronome.accent}40;
`;

interface PreviewButtonProps {
  isPreviewing: boolean;
}

export const PreviewButton = styled.button<PreviewButtonProps>`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 28px;
  height: 28px;
  background-color: ${({ theme, isPreviewing }) =>
    isPreviewing ? theme.colors.metronome.accent : 'rgba(255, 255, 255, 0.1)'};
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
  margin-left: 2px;
  ${transition({ properties: 'transform', speed: 'fast' })}

  ${({ isPreviewing }) =>
    isPreviewing &&
    `
    transform: scale(1.2);
  `}
`;

export const SoundCardContent = styled.div`
  ${flex({ direction: 'column', gap: 'xs' })}
  width: 100%;
  padding-right: ${({ theme }) => theme.spacing.xl};
`;

export const SoundName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
`;

export const SoundDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
  opacity: 0.8;
`;
