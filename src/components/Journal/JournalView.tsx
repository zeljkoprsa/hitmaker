import styled from '@emotion/styled';
import React, { useMemo, useState } from 'react';

import { useJournal } from '../../context/JournalContext';
import { JournalEntry } from '../../core/types/JournalTypes';
import { ChevronLeftIcon, ChevronRightIcon } from '../Sidebar/icons';

import {
  formatDuration,
  formatTempos,
  groupByDay,
  isCurrentOrFutureMonth,
  localDayKey,
  monthGrid,
  sameMonth,
} from './journalView.helpers';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MonthNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const MonthLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
`;

const NavBtn = styled.button`
  width: 30px;
  height: 30px;
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.metronome.primary};
    background: rgba(255, 255, 255, 0.06);
  }

  &:disabled {
    opacity: 0.2;
    cursor: default;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const WeekdayCell = styled.div`
  text-align: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  padding: 4px 0;
`;

const DayCell = styled.button<{ isToday?: boolean; isSelected?: boolean; dim?: boolean }>`
  aspect-ratio: 1;
  border: 1px solid
    ${({ isSelected, theme }) => (isSelected ? theme.colors.metronome.accent : 'transparent')};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  background: ${({ isSelected }) => (isSelected ? 'rgba(246, 65, 5, 0.1)' : 'transparent')};
  color: ${({ dim, isToday, theme }) =>
    isToday
      ? theme.colors.metronome.accent
      : dim
        ? 'rgba(255,255,255,0.2)'
        : 'rgba(255,255,255,0.7)'};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-weight: ${({ isToday, theme }) =>
    isToday ? theme.typography.fontWeights.bold : theme.typography.fontWeights.regular};
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const Dot = styled.span<{ abandoned?: boolean }>`
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ abandoned, theme }) =>
    abandoned ? 'rgba(255,255,255,0.35)' : theme.colors.metronome.accent};
`;

const DayEntries = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DayHeading = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 2px;
`;

const EntryCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: ${({ theme }) => theme.borders.radius.md};
  overflow: hidden;
`;

const EntryHead = styled.button`
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-family: ${({ theme }) => theme.typography.fontFamily.base};

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }
`;

const EntryTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EntryName = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.metronome.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Badge = styled.span<{ abandoned?: boolean }>`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 7px;
  border-radius: 999px;
  flex-shrink: 0;
  color: ${({ abandoned, theme }) =>
    abandoned ? 'rgba(255,255,255,0.5)' : theme.colors.metronome.accent};
  background: ${({ abandoned }) =>
    abandoned ? 'rgba(255,255,255,0.06)' : 'rgba(246, 65, 5, 0.12)'};
`;

const EntryMeta = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.35);
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
`;

const NoteHint = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
`;

const Detail = styled.div`
  padding: 0 12px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const ComponentRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:last-of-type {
    border-bottom: none;
  }
`;

const ComponentName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  color: ${({ theme }) => theme.colors.metronome.primary};
`;

const ComponentTempo = styled.span`
  font-size: 11px;
  font-family: ${({ theme }) => theme.typography.fontFamily.mono};
  color: ${({ theme }) => theme.colors.metronome.accent};
  flex-shrink: 0;
`;

const ReflectionLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.3);
  margin: 12px 0 6px;
`;

const ReflectionArea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 60px;
  resize: vertical;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  padding: 8px 10px;
  color: ${({ theme }) => theme.colors.metronome.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  font-family: ${({ theme }) => theme.typography.fontFamily.base};
  line-height: 1.5;
  outline: none;

  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const SaveNote = styled.button`
  margin-top: 6px;
  background: rgba(246, 65, 5, 0.12);
  border: 1px solid rgba(246, 65, 5, 0.3);
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  color: ${({ theme }) => theme.colors.metronome.accent};
  font-size: ${({ theme }) => theme.typography.fontSizes.xs};
  cursor: pointer;
  padding: 6px 12px;
  min-height: 32px;

  &:hover {
    background: rgba(246, 65, 5, 0.2);
  }
`;

const EmptyState = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.sm};
  color: rgba(255, 255, 255, 0.3);
  text-align: center;
  padding: 32px 12px;
  line-height: 1.5;
`;

const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const EntryDetail: React.FC<{ entry: JournalEntry }> = ({ entry }) => {
  const { updateReflection } = useJournal();
  const [note, setNote] = useState(entry.reflection ?? '');
  const dirty = note.trim() !== (entry.reflection ?? '');

  return (
    <Detail>
      {entry.components.map((c, i) => (
        <ComponentRow key={i}>
          <ComponentName>{c.label}</ComponentName>
          <ComponentTempo>{formatTempos(c.tempos)}</ComponentTempo>
        </ComponentRow>
      ))}

      <ReflectionLabel>Reflection</ReflectionLabel>
      <ReflectionArea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="How did it go? (optional)"
      />
      {dirty && <SaveNote onClick={() => updateReflection(entry.id, note)}>Save note</SaveNote>}
    </Detail>
  );
};

export const JournalView: React.FC = () => {
  const { entries } = useJournal();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState<string>(() => localDayKey(today));
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);

  const byDay = useMemo(() => groupByDay(entries), [entries]);
  const grid = useMemo(() => monthGrid(month), [month]);
  const selectedEntries = byDay.get(selectedKey) ?? [];

  const shiftMonth = (delta: number) => {
    setMonth(m => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  if (entries.length === 0) {
    return (
      <EmptyState>
        No practice logged yet.
        <br />
        Runs you complete will appear here.
      </EmptyState>
    );
  }

  return (
    <>
      <MonthNav>
        <NavBtn onClick={() => shiftMonth(-1)} aria-label="Previous month">
          <ChevronLeftIcon size={16} />
        </NavBtn>
        <MonthLabel>{month.toLocaleDateString([], { month: 'long', year: 'numeric' })}</MonthLabel>
        <NavBtn
          onClick={() => shiftMonth(1)}
          disabled={isCurrentOrFutureMonth(month)}
          aria-label="Next month"
        >
          <ChevronRightIcon size={16} />
        </NavBtn>
      </MonthNav>

      <Grid>
        {WEEKDAYS.map((d, i) => (
          <WeekdayCell key={i}>{d}</WeekdayCell>
        ))}
        {grid.map(day => {
          const key = localDayKey(day);
          const dayEntries = byDay.get(key);
          const hasCompleted = dayEntries?.some(e => e.status === 'completed');
          const hasAny = Boolean(dayEntries?.length);
          return (
            <DayCell
              key={key}
              dim={!sameMonth(day, month)}
              isToday={key === localDayKey(today)}
              isSelected={key === selectedKey}
              onClick={() => {
                setSelectedKey(key);
                setOpenEntryId(null);
              }}
            >
              {day.getDate()}
              {hasAny && <Dot abandoned={!hasCompleted} />}
            </DayCell>
          );
        })}
      </Grid>

      {selectedEntries.length > 0 && (
        <DayEntries>
          <DayHeading>
            {new Date(selectedKey).toLocaleDateString([], {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </DayHeading>
          {selectedEntries.map(entry => {
            const open = openEntryId === entry.id;
            const totalTempos = entry.components.flatMap(c => c.tempos);
            return (
              <EntryCard key={entry.id}>
                <EntryHead onClick={() => setOpenEntryId(open ? null : entry.id)}>
                  <EntryTitleRow>
                    <EntryName>{entry.name}</EntryName>
                    {entry.status === 'abandoned' && <Badge abandoned>Bailed</Badge>}
                    <Badge>{entry.runType}</Badge>
                  </EntryTitleRow>
                  <EntryMeta>
                    {timeOf(entry.endedAt)} · {formatDuration(entry.durationMinutes)} ·{' '}
                    {entry.blocksCompleted}/{entry.blocksTotal} blocks
                    {totalTempos.length > 0 && ` · ${formatTempos(totalTempos)}`}
                  </EntryMeta>
                  {!open && entry.reflection && <NoteHint>“{entry.reflection}”</NoteHint>}
                </EntryHead>
                {open && <EntryDetail entry={entry} />}
              </EntryCard>
            );
          })}
        </DayEntries>
      )}
    </>
  );
};

export default JournalView;
