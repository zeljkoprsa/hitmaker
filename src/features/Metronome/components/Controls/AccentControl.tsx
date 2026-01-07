import React from 'react';

import { AccentLevel } from '../../../../core/types/MetronomeTypes';

import { AccentControlContainer, AccentHeader, NoteList, NoteButton } from './styles';

interface AccentControlProps {
  accents: AccentLevel[];
  onToggleAccent: (index: number) => void;
}

const NoteIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);

const RestIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.6 15.6c-.6.6-1.5 1-2.4 1s-1.8-.4-2.4-1c-1-1-1-2.6 0-3.6l4-4c.6-.6 1-1.5 1-2.4 0-1.2-.8-2.2-2-2.3-.9-.1-1.9.3-2.5.9l-4 4c-.6.6-1 1.5-1 2.4 0 1.2.8 2.2 2 2.3.9.1 1.9-.3 2.5-.9l4-4c.6-.6 1.5-1 2.4-1 1.8 0 3.4 1.6 3.4 3.4 0 .9-.4 1.8-1 2.4l-4 3.8z" />
    <path d="M9 16.5c-1 0-1.5.5-1.5 1s.5 1.5 1.5 1.5 2-1 2-2.5h-2zm2.5-12c-1.5 0-2.5 1-2.5 2.5 0 1 .5 1.5 1.5 1.5V11L7 13.5v1c0 1 1 2 2.5 2h.5c1.5 0 2.5-1 2.5-2.5V13l3.5-2.5V8.5C16 7 15 6 13.5 6h-2z" />
  </svg>
);

const QuarterRestIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.5 18c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5c.8 0 1.5.7 1.5 1.5S9.3 18 8.5 18zM14 6l-2.8 5.6-2.5-1.2c-.4-.2-.8-.1-1.1.2l-1 1.3c-.2.3-.2.8.2 1l5.5 2.8c.8.4 1.8 0 2.1-.8l2.6-5.2c.4-.8.1-1.8-.7-2.2l-1.3-.7c-.3-.2-.7-.1-1 .2z"
      transform="rotate(-15 12 12)"
    />
  </svg>
);

export const AccentControl: React.FC<AccentControlProps> = ({ accents, onToggleAccent }) => {
  return (
    <AccentControlContainer>
      <AccentHeader>Accents</AccentHeader>
      <NoteList>
        {accents.map((level, index) => (
          <NoteButton
            key={index}
            accentLevel={level}
            onClick={() => onToggleAccent(index)}
            aria-label={`Beat ${index + 1} accent level: ${AccentLevel[level]}`}
          >
            {level === AccentLevel.Mute ? (
              <span style={{ fontSize: '24px', lineHeight: 1 }}>𝄽</span>
            ) : (
              <NoteIcon />
            )}
          </NoteButton>
        ))}
      </NoteList>
    </AccentControlContainer>
  );
};
