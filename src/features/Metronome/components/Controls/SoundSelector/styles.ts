import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { flex, transition } from '../../../../../shared/styles/mixins';

export const SoundSelectorContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
`;

export const DropdownPanel = styled(motion.div)`
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 95%;
  max-height: 13vh;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.metronome.background};
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: ${({ theme }) => theme.spacing.md};
  z-index: ${({ theme }) => theme.zIndices.dropdown};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};

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
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

interface SoundCardProps {
  isSelected: boolean;
}

export const SoundCard = styled(motion.button)<SoundCardProps>`
  ${flex({ direction: 'row', align: 'center', justify: 'space-between' })}
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: transparent;
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  cursor: pointer;
  text-align: left;
  color: ${({ theme }) => theme.colors.metronome.primary};
  ${transition({ properties: ['background-color', 'color'], speed: 'fast' })}

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.text.primary}0F`};
  }

  ${({ isSelected, theme }) =>
    isSelected &&
    `
    color: ${theme.colors.metronome.accent};
  `}
`;

export const CheckIcon = styled(motion.span)`
  color: ${({ theme }) => theme.colors.metronome.accent};
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
`;

export const SoundName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.md};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: inherit;
  line-height: ${({ theme }) => theme.typography.lineHeights.tight};
`;
