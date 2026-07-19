import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import React, { useEffect } from 'react';

import { Lesson } from '../../core/types/LessonTypes';
import { SessionBlock, SessionSection } from '../../core/types/SessionTypes';

/**
 * Data-driven session card (spec #7): renders any stored lesson from its
 * sections/blocks/content. Replaces the original hand-coded card, keeping
 * its look: numbered sections, dotted items with dimmed notes, BPM tags,
 * and a Mission-style outro for sectionless teach blocks.
 */
interface LessonModalProps {
  lesson: Lesson | null;
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

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: ${({ theme }) => theme.zIndices.modal + 10};
  animation: ${fadeIn} 200ms ease-out;
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

const ModalContainer = styled.div`
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
  text-transform: uppercase;

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
  text-transform: uppercase;
`;

const MissionItems = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 16px 0;
  padding: 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const MissionItem = styled.li`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: ${({ theme }) => theme.colors.metronome.primary};
  padding-left: 18px;
  position: relative;
  line-height: 1.5;

  &::before {
    content: '→';
    position: absolute;
    left: 0;
    color: ${({ theme }) => theme.colors.metronome.accent};
    font-size: 12px;
  }

  em {
    font-style: italic;
    color: rgba(255, 255, 255, 0.4);
    font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  }
`;

const SourceLink = styled.a`
  color: ${({ theme }) => theme.colors.metronome.accent};
  text-decoration: none;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
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
    content: '✦';
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

const Prose = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-style: italic;
  color: rgba(255, 255, 255, 0.4);
  padding-top: 8px;
`;

/** Last word of the name gets the accent, like the original card art. */
const renderTitle = (name: string): React.ReactNode => {
  const words = name.trim().split(/\s+/);
  if (words.length < 2) return <span>{name}</span>;
  const last = words.pop();
  return (
    <>
      {words.join(' ')} <span>{last}</span>
    </>
  );
};

/** Badge text: the first labelled part of the block eyebrow ("technique ·
 *  hand sticking" → "technique"). Warm variant for untimed (warm-up-ish)
 *  sections, tech for tempo work. */
const sectionBadge = (
  blocks: SessionBlock[]
): { text: string; variant: 'warm' | 'tech' } | null => {
  const eyebrow = blocks.find(b => b.content?.eyebrow)?.content?.eyebrow;
  if (!eyebrow) return null;
  const text = eyebrow.split('·')[0].trim();
  const variant = blocks.some(b => b.tempo != null) ? 'tech' : 'warm';
  return { text, variant };
};

const dotColor = (block: SessionBlock): 'warm' | 'dim' | 'accent' => {
  if (block.tempo != null) return 'accent';
  return block.type === 'teach' ? 'warm' : 'dim';
};

const RANGE_RE = /(\d+\s*[–-]\s*\d+)/;

/** BPM tag for an item on a tempo'd block: a range quoted in its note
 *  ("work the range 50–120") wins over the block's starting tempo; the
 *  quoted phrase leaves the note. Untimed blocks never get a tag — a range
 *  in their notes is prose ("hold 15–20s"), not BPM. */
const splitNote = (
  note: string | undefined,
  block: SessionBlock
): { tag: string | null; note: string | null } => {
  if (block.tempo == null) return { tag: null, note: note ?? null };
  const range = note?.match(RANGE_RE)?.[1] ?? null;
  if (range && note) {
    const cleaned = note
      .replace(/\s*[·—-]?\s*work the range\s*\d+\s*[–-]\s*\d+/i, '')
      .replace(RANGE_RE, '')
      .replace(/\s*[·—-]\s*$/, '')
      .trim();
    return { tag: range, note: cleaned || null };
  }
  return { tag: block.tempo != null ? `${block.tempo}` : null, note: note ?? null };
};

const SectionCard: React.FC<{ section: SessionSection; blocks: SessionBlock[]; index: number }> = ({
  section,
  blocks,
  index,
}) => {
  const badge = sectionBadge(blocks);
  const prose = blocks.map(b => b.content?.prose).filter(Boolean);
  return (
    <Section delay={index + 1}>
      <SectionHeaderRow>
        <SectionNum>{String(index + 1).padStart(2, '0')}</SectionNum>
        <SectionTitle>{section.name}</SectionTitle>
        {badge && <SectionBadge variant={badge.variant}>{badge.text}</SectionBadge>}
      </SectionHeaderRow>
      <Card>
        {blocks.flatMap(block =>
          (block.content?.items ?? []).map((item, i) => {
            const { tag, note } = splitNote(item.note, block);
            return (
              <Item key={`${block.id}-${i}`}>
                <Dot color={dotColor(block)} />
                <ItemText>
                  {item.text}
                  {note && (
                    <em>
                      {' — '}
                      <Linkify text={note} />
                    </em>
                  )}
                </ItemText>
                {tag && <BpmTag>{tag}</BpmTag>}
              </Item>
            );
          })
        )}
        {prose.map((p, i) => (
          <Prose key={i}>{p}</Prose>
        ))}
      </Card>
    </Section>
  );
};

/** Sectionless teach blocks with content render Mission-style after the
 *  divider; a bonus note demotes an item to the starred footer list. */
const OutroCard: React.FC<{ block: SessionBlock; index: number }> = ({ block, index }) => {
  const items = block.content?.items ?? [];
  const main = items.filter(i => i.note !== 'bonus');
  const bonus = items.filter(i => i.note === 'bonus');
  return (
    <Section delay={index}>
      <MissionCard>
        {block.label && <MissionTitle>{block.label}</MissionTitle>}
        {main.length > 0 && (
          <MissionItems>
            {main.map((item, i) => (
              <MissionItem key={i}>
                {item.text}
                {item.note && (
                  <em>
                    {' — '}
                    <Linkify text={item.note} />
                  </em>
                )}
              </MissionItem>
            ))}
          </MissionItems>
        )}
        {bonus.length > 0 && (
          <BonusRow>
            {bonus.map((item, i) => (
              <BonusItem key={i}>{item.text}</BonusItem>
            ))}
          </BonusRow>
        )}
      </MissionCard>
    </Section>
  );
};

const URL_RE = /^https?:\/\/\S+$/;

/** Bare-URL notes (a distilled item's source link, spec #9) render as real
 *  links; everything else stays plain text. */
const Linkify: React.FC<{ text: string }> = ({ text }) =>
  URL_RE.test(text) ? (
    <SourceLink href={text} target="_blank" rel="noreferrer noopener">
      {text}
    </SourceLink>
  ) : (
    <>{text}</>
  );

const LessonModal: React.FC<LessonModalProps> = ({ lesson, onClose }) => {
  const isOpen = lesson !== null;

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

  if (!lesson) return null;

  const blockById = new Map(lesson.blocks.map(b => [b.id, b]));
  const sections = lesson.sections ?? [];
  const sectionedIds = new Set(sections.flatMap(s => s.blockIds));
  const outroBlocks = lesson.blocks.filter(
    b => !sectionedIds.has(b.id) && b.type === 'teach' && b.content
  );
  const mantra = outroBlocks.map(b => b.content?.prose).find(Boolean);

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="Close">
          ✕
        </CloseButton>
        <ModalContent>
          <Header>
            <Eyebrow>
              Session Card{lesson.lessonNumber ? ` · Lesson ${lesson.lessonNumber}` : ''}
            </Eyebrow>
            <Title>{renderTitle(lesson.name)}</Title>
          </Header>

          {sections.map((section, i) => (
            <SectionCard
              key={section.id}
              section={section}
              blocks={section.blockIds
                .map(id => blockById.get(id))
                .filter((b): b is SessionBlock => b !== undefined)}
              index={i}
            />
          ))}

          {outroBlocks.length > 0 && <Divider />}

          {outroBlocks.map((block, i) => (
            <OutroCard key={block.id} block={block} index={sections.length + 1 + i} />
          ))}

          {mantra && <Mantra>{mantra}</Mantra>}
        </ModalContent>
      </ModalContainer>
    </Overlay>
  );
};

export default LessonModal;
