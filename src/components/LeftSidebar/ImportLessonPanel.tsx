import styled from '@emotion/styled';
import React, { useMemo, useRef, useState } from 'react';

import { LessonDraft } from '../../context/LessonsContext';
import { parseLessonMarkdown } from '../../core/utils/lessonMarkdown';

/**
 * Markdown lesson import (spec #8). Paste or upload a .md file; the parse
 * result is previewed live (sections/blocks/warnings) and always opens as a
 * DRAFT in the LessonEditor — import never saves directly.
 */
interface ImportLessonPanelProps {
  onDraft: (draft: LessonDraft) => void;
  onCancel: () => void;
}

const Intro = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.55;
  margin: 0 0 12px;
`;

const TextArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 220px;
  resize: vertical;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  padding: 12px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  line-height: 1.6;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.metronome.accent};
    box-shadow: 0 0 0 2px rgba(246, 65, 5, 0.12);
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

const FileBtn = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.5);
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  cursor: pointer;
  padding: 8px 12px;
  min-height: 36px;
  transition:
    color 150ms ease,
    border-color 150ms ease;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const Summary = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: rgba(255, 255, 255, 0.55);
  flex: 1;
  text-align: right;
`;

const WarningList = styled.ul`
  margin: 10px 0 0;
  padding: 10px 12px 10px 26px;
  background: rgba(246, 65, 5, 0.06);
  border: 1px solid rgba(246, 65, 5, 0.2);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WarningItem = styled.li`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.5;
`;

const Help = styled.details`
  margin-top: 12px;
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.45);

  summary {
    cursor: pointer;
    color: rgba(255, 255, 255, 0.35);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 10px;

    &:hover {
      color: rgba(255, 255, 255, 0.6);
    }
  }
`;

const HelpTable = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 12px;
  margin-top: 10px;

  code {
    font-family: ${({ theme }) => theme.typography.fontFamily.mono};
    color: ${({ theme }) => theme.colors.metronome.accent};
    white-space: nowrap;
  }
`;

const Footer = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  margin-top: 12px;
`;

const OpenDraftBtn = styled.button`
  flex: 1;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.metronome.accent} 0%,
    #d63a04 100%
  );
  border: none;
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  cursor: pointer;
  padding: 10px;
  min-height: 44px;
  transition: opacity 150ms ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const CancelBtn = styled.button`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  color: rgba(255, 255, 255, 0.4);
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  cursor: pointer;
  padding: 10px 16px;
  min-height: 44px;
  transition: background-color 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }
`;

const HELP_ROWS: Array<[string, string]> = [
  ['# Title', 'lesson name ("Lesson 02" on the next line sets the number)'],
  ['## Heading', 'section (pickable in the composer)'],
  ['### Heading', 'block in the section — [teach] / [do] / [break] overrides its type'],
  ['@ 60bpm 4/4 eighth · 4min', 'tempo, time sig, subdivision, duration — any subset'],
  ['- Text — note', 'card item; the spaced dash splits the dimmed note'],
  ['> Quote', 'prose on the block (mantras, reminders)'],
  ['---', 'structural break; blocks after it are sectionless'],
];

export const ImportLessonPanel: React.FC<ImportLessonPanelProps> = ({ onDraft, onCancel }) => {
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => (text.trim() ? parseLessonMarkdown(text) : null), [text]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ''));
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleOpenDraft = () => {
    if (!parsed) return;
    const { lesson } = parsed;
    onDraft({
      name: lesson.name,
      lessonNumber: lesson.lessonNumber,
      sections: lesson.sections,
      blocks: lesson.blocks,
    });
  };

  return (
    <>
      <Intro>
        Paste lesson markdown or upload a .md file. Everything lands as a draft in the editor —
        nothing is saved until you review it.
      </Intro>

      <TextArea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={
          '# Lesson name\n\n## Section\n### Exercise\n@ 60bpm 4/4 quarter · 4min\n- First focus point — a dimmed note'
        }
        aria-label="Lesson markdown"
        autoFocus
      />

      <Row>
        <FileBtn onClick={() => fileRef.current?.click()}>Upload .md file</FileBtn>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,.txt,text/markdown,text/plain"
          onChange={handleFile}
          hidden
        />
        {parsed && (
          <Summary>
            {parsed.lesson.sections.length} sections · {parsed.lesson.blocks.length} blocks
            {parsed.warnings.length > 0 && ` · ${parsed.warnings.length} notes`}
          </Summary>
        )}
      </Row>

      {parsed && parsed.warnings.length > 0 && (
        <WarningList>
          {parsed.warnings.map((w, i) => (
            <WarningItem key={i}>{w}</WarningItem>
          ))}
        </WarningList>
      )}

      <Help>
        <summary>Notation reference</summary>
        <HelpTable>
          {HELP_ROWS.map(([code, desc]) => (
            <React.Fragment key={code}>
              <code>{code}</code>
              <span>{desc}</span>
            </React.Fragment>
          ))}
        </HelpTable>
      </Help>

      <Footer>
        <CancelBtn onClick={onCancel}>Cancel</CancelBtn>
        <OpenDraftBtn
          onClick={handleOpenDraft}
          disabled={!parsed || parsed.lesson.blocks.length === 0}
        >
          Open as draft
        </OpenDraftBtn>
      </Footer>
    </>
  );
};

export default ImportLessonPanel;
