import { useEffect } from 'react';

const MIN_TEMPO = 30;
const MAX_TEMPO = 500;

const isInputFocused = () => {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    (el as HTMLElement).isContentEditable
  );
};

interface UseKeyboardShortcutsOptions {
  togglePlay: () => Promise<void>;
  tempo: number;
  setTempo: (bpm: number) => void;
}

export function useKeyboardShortcuts({ togglePlay, tempo, setTempo }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setTempo(Math.min(MAX_TEMPO, tempo + (e.shiftKey ? 5 : 1)));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setTempo(Math.max(MIN_TEMPO, tempo - (e.shiftKey ? 5 : 1)));
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, tempo, setTempo]);
}
