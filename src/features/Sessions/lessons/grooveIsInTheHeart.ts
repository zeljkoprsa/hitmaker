import { PracticeSession } from '../../../core/types/SessionTypes';

/**
 * Lesson 01 · Groove Is In The Heart — as a guided run.
 *
 * Content transcribed 1:1 from the read-only session card (LessonModal):
 * all five sections, the Mission and the mantra are carried over; nothing
 * dropped. The card's open BPM ranges ("50–120") become starting tempos at
 * the low end of the range with the range noted on the block — placeholders
 * for Jake to tune after feeling the run (spec #3 §7).
 */
export const GROOVE_IS_IN_THE_HEART: PracticeSession = {
  id: 'lesson-groove-is-in-the-heart',
  name: 'Groove Is In The Heart',
  guided: true,
  createdAt: '',
  updatedAt: '',
  // Pickable sections for the composer (spec #5) — the five headings of the
  // original card. The rests between sections and the Mission outro belong
  // to no section: structural, never offered as components.
  sections: [
    { id: 'stretching', name: 'Stretching', blockIds: ['l1-stretching'] },
    { id: 'free-expression', name: 'Free Expression', blockIds: ['l1-free-expression'] },
    {
      id: 'hand-sticking',
      name: 'Hand Sticking',
      blockIds: ['l1-single-strokes', 'l1-around-the-kit'],
    },
    {
      id: 'leg-independence',
      name: 'Leg Independence',
      blockIds: ['l1-bass-drum', 'l1-hihat-kick'],
    },
    { id: 'hihat-riding', name: 'Hi-Hat Riding', blockIds: ['l1-hihat-riding'] },
  ],
  blocks: [
    {
      id: 'l1-stretching',
      type: 'teach',
      label: 'Stretching',
      durationMinutes: 3,
      content: {
        eyebrow: 'warm-up',
        items: [
          { text: 'Arms across chest', note: 'hold 15–20s each side' },
          { text: 'Wrists: palm up + down, both directions' },
          { text: 'Loosen shoulders & fingers' },
        ],
      },
    },
    {
      id: 'l1-free-expression',
      type: 'do',
      label: 'Free Expression',
      // No tempo: arrhythmic, unarticulated, unburdened — metronome stays silent
      durationMinutes: 3,
      content: {
        eyebrow: 'no rules',
        items: [{ text: 'Arrhythmic, unarticulated, unburdened' }],
        prose: 'Just play. No judgment.',
      },
    },
    {
      id: 'l1-single-strokes',
      type: 'do',
      label: 'Single Strokes',
      tempo: 60,
      timeSignature: { beats: 4, noteValue: 4 },
      subdivision: 'quarter',
      durationMinutes: 4,
      content: {
        eyebrow: 'technique · hand sticking',
        items: [{ text: 'Single strokes', note: 'limb dependency · work the range 50–120' }],
      },
    },
    {
      id: 'l1-around-the-kit',
      type: 'do',
      label: 'Around the Kit',
      tempo: 60,
      timeSignature: { beats: 4, noteValue: 4 },
      subdivision: 'quarter',
      durationMinutes: 4,
      content: {
        eyebrow: 'technique · hand sticking',
        items: [{ text: 'Around the kit', note: 'spatial awareness · work the range 50–120' }],
      },
    },
    {
      id: 'l1-break-1',
      type: 'break',
      label: 'Rest',
      durationMinutes: 0.5,
    },
    {
      id: 'l1-bass-drum',
      type: 'do',
      label: 'Bass Drum',
      tempo: 60,
      timeSignature: { beats: 4, noteValue: 4 },
      subdivision: 'quarter',
      durationMinutes: 4,
      content: {
        eyebrow: 'technique · leg independence',
        items: [{ text: 'Bass drum', note: 'work the range 50–120' }],
      },
    },
    {
      id: 'l1-hihat-kick',
      type: 'do',
      label: 'Hi-Hat / Kick Alternates',
      tempo: 60,
      timeSignature: { beats: 4, noteValue: 4 },
      subdivision: 'eighth',
      durationMinutes: 4,
      content: {
        eyebrow: 'technique · leg independence',
        items: [{ text: 'Hi-hat / kick alternates', note: 'work the range 50–120' }],
      },
    },
    {
      id: 'l1-break-2',
      type: 'break',
      label: 'Rest',
      durationMinutes: 0.5,
    },
    {
      id: 'l1-hihat-riding',
      type: 'do',
      label: 'Hi-Hat Riding',
      tempo: 70,
      timeSignature: { beats: 4, noteValue: 4 },
      subdivision: 'eighth',
      durationMinutes: 5,
      content: {
        eyebrow: 'technique',
        items: [
          { text: '♩ Quarters → ♪ Eighths → ♬ Sixteenths' },
          { text: 'Accents · Dynamics · Ahead / Behind' },
          { text: 'Even → Shuffle → Swing' },
        ],
      },
    },
    {
      id: 'l1-mission',
      type: 'teach',
      label: 'Mission',
      durationMinutes: 1,
      content: {
        eyebrow: 'mission',
        items: [
          { text: 'Groove and flow above all' },
          { text: 'Even strokes, even kicks, controlled dynamics' },
          { text: 'Active listening & full awareness' },
          { text: 'One exercise at a time — focused, slow & steady' },
          { text: 'Sing along & audiate while you play', note: 'bonus' },
          { text: 'Record → listen back → iterate', note: 'bonus' },
          { text: 'Weekly review — repeat until you become groove', note: 'bonus' },
        ],
        prose: 'HAVE FUN ✦',
      },
    },
  ],
};
