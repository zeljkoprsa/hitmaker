import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect } from 'react';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: ${({ theme }) => theme.zIndices.modal + 10};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: opacity 200ms ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 24px 16px 48px;

  @media (min-width: 768px) {
    padding: 48px 24px;
    align-items: center;
  }
`;

const ModalContainer = styled.div<{ isOpen: boolean }>`
  background: ${({ theme }) => theme.colors.metronome.darkBackground};
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.lg};
  width: 100%;
  max-width: 600px;
  max-height: calc(100dvh - 48px);
  overflow-y: auto;
  position: relative;
  animation: ${fadeIn} 200ms ease-out;

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }

  @media (min-width: 768px) {
    max-height: 90vh;
  }
`;

const ModalContent = styled.div`
  padding: 24px 24px 48px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  z-index: 10;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (hover: none) and (pointer: coarse) {
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.5);
    }
  }
`;

const Header = styled.div`
  margin-bottom: 32px;
  opacity: 0;
  animation: ${fadeUp} 0.6s ease forwards;
`;

const Eyebrow = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.metronome.accent};
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-family: 'Bebas Neue', Impact, 'Arial Narrow', sans-serif;
  font-size: clamp(42px, 12vw, 64px);
  line-height: 0.9;
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.metronome.primary};
  margin: 0;

  span {
    color: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

const Section = styled.div<{ delay?: number }>`
  margin-bottom: 20px;
  opacity: 0;
  animation: ${fadeUp} 0.6s ease forwards;
  animation-delay: ${({ delay = 0 }) => delay * 0.06}s;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const SectionNum = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
  min-width: 24px;
`;

const SectionTitle = styled.span`
  font-family: 'Bebas Neue', Impact, 'Arial Narrow', sans-serif;
  font-size: 22px;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.metronome.primary};
  flex: 1;
`;

const SectionBadge = styled.span<{ variant?: 'warm' | 'tech' }>`
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  background: ${({ variant }) =>
    variant === 'warm'
      ? `rgba(246, 65, 5, 0.15)`
      : variant === 'tech'
        ? `rgba(246, 65, 5, 0.08)`
        : 'rgba(255, 255, 255, 0.05)'};
  color: ${({ variant, theme }) =>
    variant === 'warm' || variant === 'tech'
      ? theme.colors.metronome.accent
      : 'rgba(255, 255, 255, 0.4)'};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.metronome.background};
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 16px 18px;
`;

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-of-type {
    padding-top: 0;
  }
`;

const Dot = styled.div<{ color?: 'warm' | 'dim' | 'accent' }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ color, theme }) =>
    color === 'warm'
      ? theme.colors.warning
      : color === 'dim'
        ? 'rgba(255, 255, 255, 0.15)'
        : theme.colors.metronome.accent};
  margin-top: 7px;
  flex-shrink: 0;
`;

const ItemText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.metronome.primary};
  flex: 1;

  em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.4);
    font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  }
`;

const BpmTag = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.metronome.accent};
  background: rgba(246, 65, 5, 0.1);
  border: 1px solid rgba(246, 65, 5, 0.25);
  padding: 3px 8px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  white-space: nowrap;
  align-self: center;
  flex-shrink: 0;
  letter-spacing: 0.05em;
`;

const HihatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const HihatChip = styled.div<{ full?: boolean }>`
  background: rgba(246, 65, 5, 0.06);
  border: 1px solid rgba(246, 65, 5, 0.15);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.metronome.primary};
  letter-spacing: 0.03em;
  text-align: center;
  ${({ full }) => full && 'grid-column: 1 / -1;'}
`;

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(
    to right,
    ${({ theme }) => theme.colors.metronome.accent},
    transparent
  );
  margin: 28px 0;
  opacity: 0;
  animation: ${fadeUp} 0.6s ease 0.3s forwards;
`;

const MissionCard = styled.div`
  background: ${({ theme }) => theme.colors.metronome.background};
  border: 1px solid rgba(246, 65, 5, 0.3);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 20px 18px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.metronome.accent};
  }
`;

const MissionTitle = styled.div`
  font-family: 'Bebas Neue', Impact, 'Arial Narrow', sans-serif;
  font-size: 14px;
  letter-spacing: 0.2em;
  color: ${({ theme }) => theme.colors.metronome.accent};
  margin-bottom: 14px;
`;

const MissionItems = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 16px 0;
  padding: 0;
`;

const MissionItem = styled.li`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.metronome.primary};
  padding-left: 18px;
  position: relative;
  line-height: 1.5;

  &::before {
    content: '\u2192';
    position: absolute;
    left: 0;
    color: ${({ theme }) => theme.colors.metronome.accent};
    font-size: 12px;
  }
`;

const BonusRow = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BonusItem = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '\u2726';
    color: ${({ theme }) => theme.colors.metronome.accent};
    font-size: 8px;
  }
`;

const Mantra = styled.div`
  font-family: 'Bebas Neue', Impact, 'Arial Narrow', sans-serif;
  font-size: clamp(28px, 8vw, 44px);
  color: ${({ theme }) => theme.colors.metronome.accent};
  text-align: center;
  letter-spacing: 0.05em;
  margin-top: 36px;
  opacity: 0;
  animation: ${fadeUp} 0.6s ease 0.5s forwards;
`;

const LessonModal: React.FC<LessonModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer isOpen={isOpen} onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">
          ✕
        </CloseButton>
        <ModalContent>
          <Header>
            <Eyebrow>Session Card · Lesson 01</Eyebrow>
            <Title>
              GROOVE IS
              <br />
              IN THE <span>HEART</span>
            </Title>
          </Header>

          {/* Stretching */}
          <Section delay={1}>
            <SectionHeaderRow>
              <SectionNum>01</SectionNum>
              <SectionTitle>Stretching</SectionTitle>
              <SectionBadge variant="warm">warm-up</SectionBadge>
            </SectionHeaderRow>
            <Card>
              <Item>
                <Dot color="warm" />
                <ItemText>Arms across chest — hold 15–20s each side</ItemText>
              </Item>
              <Item>
                <Dot color="warm" />
                <ItemText>Wrists: palm up + down, both directions</ItemText>
              </Item>
              <Item>
                <Dot color="warm" />
                <ItemText>Loosen shoulders & fingers</ItemText>
              </Item>
            </Card>
          </Section>

          {/* Free Expression */}
          <Section delay={2}>
            <SectionHeaderRow>
              <SectionNum>02</SectionNum>
              <SectionTitle>Free Expression</SectionTitle>
              <SectionBadge variant="warm">no rules</SectionBadge>
            </SectionHeaderRow>
            <Card>
              <Item>
                <Dot color="dim" />
                <ItemText>
                  Arrhythmic, unarticulated, unburdened
                  <br />
                  <em>Just play. No judgment.</em>
                </ItemText>
              </Item>
            </Card>
          </Section>

          {/* Hand Sticking */}
          <Section delay={3}>
            <SectionHeaderRow>
              <SectionNum>03</SectionNum>
              <SectionTitle>Hand Sticking</SectionTitle>
              <SectionBadge variant="tech">technique</SectionBadge>
            </SectionHeaderRow>
            <Card>
              <Item>
                <Dot />
                <ItemText>
                  Single strokes <em>— limb dependency</em>
                </ItemText>
                <BpmTag>50–120</BpmTag>
              </Item>
              <Item>
                <Dot />
                <ItemText>
                  Around the kit <em>— spatial awareness</em>
                </ItemText>
                <BpmTag>50–120</BpmTag>
              </Item>
            </Card>
          </Section>

          {/* Leg Independence */}
          <Section delay={4}>
            <SectionHeaderRow>
              <SectionNum>04</SectionNum>
              <SectionTitle>Leg Independence</SectionTitle>
              <SectionBadge variant="tech">technique</SectionBadge>
            </SectionHeaderRow>
            <Card>
              <Item>
                <Dot />
                <ItemText>Bass drum</ItemText>
                <BpmTag>50–120</BpmTag>
              </Item>
              <Item>
                <Dot />
                <ItemText>Hi-hat / kick alternates</ItemText>
                <BpmTag>50–120</BpmTag>
              </Item>
            </Card>
          </Section>

          {/* Hi-Hat Riding */}
          <Section delay={5}>
            <SectionHeaderRow>
              <SectionNum>05</SectionNum>
              <SectionTitle>Hi-Hat Riding</SectionTitle>
              <SectionBadge variant="tech">technique</SectionBadge>
            </SectionHeaderRow>
            <Card>
              <HihatGrid>
                <HihatChip>♩ Quarters</HihatChip>
                <HihatChip>♪ Eighths</HihatChip>
                <HihatChip>♬ Sixteenths</HihatChip>
                <HihatChip>Accents</HihatChip>
                <HihatChip>Dynamics</HihatChip>
                <HihatChip>Ahead / Behind</HihatChip>
                <HihatChip full>Even → Shuffle → Swing</HihatChip>
              </HihatGrid>
            </Card>
          </Section>

          <Divider />

          {/* Mission */}
          <Section delay={6}>
            <MissionCard>
              <MissionTitle>Mission</MissionTitle>
              <MissionItems>
                <MissionItem>Groove and flow above all</MissionItem>
                <MissionItem>Even strokes, even kicks, controlled dynamics</MissionItem>
                <MissionItem>Active listening & full awareness</MissionItem>
                <MissionItem>One exercise at a time — focused, slow & steady</MissionItem>
              </MissionItems>
              <BonusRow>
                <BonusItem>Sing along & audiate while you play</BonusItem>
                <BonusItem>Record → listen back → iterate</BonusItem>
                <BonusItem>Weekly review — repeat until you become groove</BonusItem>
              </BonusRow>
            </MissionCard>
          </Section>

          <Mantra>HAVE FUN ✦</Mantra>
        </ModalContent>
      </ModalContainer>
    </Overlay>
  );
};

export default LessonModal;
