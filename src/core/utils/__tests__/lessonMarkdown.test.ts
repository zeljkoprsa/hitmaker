import { parseLessonMarkdown } from '../lessonMarkdown';

/** Deterministic ids for assertions. */
const makeIds = () => {
  let n = 0;
  return () => `id-${++n}`;
};

/** Example A from docs/lesson-markdown-notation.md — round-trips the seeded
 *  Groove Is In The Heart structure. */
const EXAMPLE_A = `
# Groove Is In The Heart
Lesson 01

## Stretching
^ warm-up
- Arms across chest — hold 15–20s each side
- Wrists: palm up + down, both directions
- Loosen shoulders & fingers
@ 3min

## Free Expression
^ no rules
- Arrhythmic, unarticulated, unburdened
> Just play. No judgment.
@ 3min

## Hand Sticking
### Single Strokes
@ 50–120bpm 4/4 quarter · 4min
- Single strokes — limb dependency

### Around the Kit
@ 50–120bpm 4/4 quarter · 4min
- Around the kit — spatial awareness

## Hi-Hat Riding
@ 70bpm 4/4 eighth · 5min
- Even → Shuffle → Swing

---

### Mission [teach]
- Groove and flow above all
- Sing along & audiate while you play — bonus
> HAVE FUN ✦
`;

/** Example B — one exercise from the richer real curriculum file. */
const EXAMPLE_B = `
# Feet Don't Fail Me
Lesson 02

## Single Stroke Bass

### Isolate
@ 50–80bpm 4/4 quarter · 2min
- Heel-up position, ball of foot on the pedal — weight forward, ankle relaxed
> Increase in +4 BPM steps only.

### Integrate
@ 50–80bpm 4/4 eighth · 2min
- Kick: continue single strokes on 1 and 3
> The foot leads.
`;

describe('parseLessonMarkdown', () => {
  describe('Example A (Groove Is In The Heart round-trip)', () => {
    const { lesson, warnings } = parseLessonMarkdown(EXAMPLE_A, makeIds());

    it('parses name and lesson number', () => {
      expect(lesson.name).toBe('Groove Is In The Heart');
      expect(lesson.lessonNumber).toBe('01');
    });

    it('produces the four sections; Mission and the break stay sectionless', () => {
      expect(lesson.sections.map(s => s.name)).toEqual([
        'Stretching',
        'Free Expression',
        'Hand Sticking',
        'Hi-Hat Riding',
      ]);
      const sectioned = new Set(lesson.sections.flatMap(s => s.blockIds));
      const orphans = lesson.blocks.filter(b => !sectioned.has(b.id));
      expect(orphans.map(b => b.label)).toEqual(['Rest', 'Mission']);
    });

    it('items directly under ## form one implicit block named after the section', () => {
      const stretching = lesson.sections[0];
      expect(stretching.blockIds).toHaveLength(1);
      const block = lesson.blocks.find(b => b.id === stretching.blockIds[0])!;
      expect(block.label).toBe('Stretching');
      expect(block.type).toBe('teach');
      expect(block.durationMinutes).toBe(3);
      expect(block.tempo).toBeUndefined();
      expect(block.content?.eyebrow).toBe('warm-up');
      expect(block.content?.items).toEqual([
        { text: 'Arms across chest', note: 'hold 15–20s each side' },
        { text: 'Wrists: palm up + down, both directions' },
        { text: 'Loosen shoulders & fingers' },
      ]);
    });

    it('a tempo range starts at the low end and keeps the range as prose', () => {
      const single = lesson.blocks.find(b => b.label === 'Single Strokes')!;
      expect(single.type).toBe('do');
      expect(single.tempo).toBe(50);
      expect(single.timeSignature).toEqual({ beats: 4, noteValue: 4 });
      expect(single.subdivision).toBe('quarter');
      expect(single.durationMinutes).toBe(4);
      expect(single.content?.prose).toBe('Work the range 50–120 BPM.');
    });

    it('eyebrow auto-derives from the section name when not overridden', () => {
      const single = lesson.blocks.find(b => b.label === 'Single Strokes')!;
      expect(single.content?.eyebrow).toBe('hand sticking');
    });

    it('--- yields a structural break and closes the section', () => {
      const rest = lesson.blocks.find(b => b.label === 'Rest')!;
      expect(rest.type).toBe('break');
      expect(rest.durationMinutes).toBe(0.5);
      expect(rest.content).toBeUndefined();

      const mission = lesson.blocks.find(b => b.label === 'Mission')!;
      expect(mission.type).toBe('teach');
      expect(mission.content?.prose).toBe('HAVE FUN ✦');
      expect(mission.content?.items).toEqual([
        { text: 'Groove and flow above all' },
        { text: 'Sing along & audiate while you play', note: 'bonus' },
      ]);
    });

    it('parses cleanly with no warnings', () => {
      expect(warnings).toEqual([]);
    });
  });

  describe('Example B (richer real file: phases as blocks)', () => {
    const { lesson, warnings } = parseLessonMarkdown(EXAMPLE_B, makeIds());

    it('two phase blocks under one section', () => {
      expect(lesson.sections).toHaveLength(1);
      expect(lesson.sections[0].blockIds).toHaveLength(2);
      const [isolate, integrate] = lesson.blocks;
      expect(isolate.label).toBe('Isolate');
      expect(isolate.subdivision).toBe('quarter');
      expect(isolate.content?.prose).toBe(
        'Increase in +4 BPM steps only.\nWork the range 50–80 BPM.'
      );
      expect(integrate.label).toBe('Integrate');
      expect(integrate.subdivision).toBe('eighth');
      expect(integrate.tempo).toBe(50);
    });

    it('parses cleanly with no warnings', () => {
      expect(warnings).toEqual([]);
    });
  });

  describe('graceful degradation', () => {
    it('never drops unrecognized lines — they become prose with a warning', () => {
      const { lesson, warnings } = parseLessonMarkdown(
        '# T\n\n## S\nsome stray thought\n- real item',
        makeIds()
      );
      const block = lesson.blocks[0];
      expect(block.content?.prose).toBe('some stray thought');
      expect(block.content?.items).toEqual([{ text: 'real item' }]);
      expect(warnings).toHaveLength(1);
      expect(warnings[0]).toContain('stray thought');
    });

    it('handles a file with no structure at all', () => {
      const { lesson, warnings } = parseLessonMarkdown('just\nsome text', makeIds());
      expect(lesson.name).toBe('Imported Lesson');
      expect(lesson.blocks).toHaveLength(1);
      expect(lesson.blocks[0].content?.prose).toBe('just\nsome text');
      expect(warnings.length).toBeGreaterThanOrEqual(3); // 2 lines + missing title
    });

    it('handles empty input', () => {
      const { lesson, warnings } = parseLessonMarkdown('', makeIds());
      expect(lesson.name).toBe('Imported Lesson');
      expect(lesson.blocks).toEqual([]);
      expect(lesson.sections).toEqual([]);
      expect(warnings).toHaveLength(1);
    });

    it('warns on unintelligible directive tokens but keeps the parsed parts', () => {
      const { lesson, warnings } = parseLessonMarkdown(
        '# T\n## S\n@ 60bpm wibble 4/4',
        makeIds()
      );
      const block = lesson.blocks[0];
      expect(block.tempo).toBe(60);
      expect(block.timeSignature).toEqual({ beats: 4, noteValue: 4 });
      expect(warnings.some(w => w.includes('wibble'))).toBe(true);
    });

    it('drops empty sections with a warning', () => {
      const { lesson, warnings } = parseLessonMarkdown('# T\n## Empty\n## Full\n- x', makeIds());
      expect(lesson.sections.map(s => s.name)).toEqual(['Full']);
      expect(warnings.some(w => w.includes('Empty'))).toBe(true);
    });

    it('duplicate section names get unique ids', () => {
      const { lesson } = parseLessonMarkdown('# T\n## Warm-up\n- a\n## Warm-up\n- b', makeIds());
      expect(lesson.sections).toHaveLength(2);
      expect(new Set(lesson.sections.map(s => s.id)).size).toBe(2);
    });

    it('marker overrides win over directive-based type inference', () => {
      const { lesson } = parseLessonMarkdown(
        '# T\n## S\n### Listen [teach]\n@ 80bpm 2min\n### Pause [break 45s]',
        makeIds()
      );
      const [listen, pause] = lesson.blocks;
      expect(listen.type).toBe('teach');
      expect(listen.tempo).toBe(80);
      expect(pause.type).toBe('break');
      expect(pause.durationMinutes).toBeCloseTo(0.75);
    });

    it('seconds directives convert to minutes', () => {
      const { lesson } = parseLessonMarkdown('# T\n## S\n### B\n@ 90s', makeIds());
      expect(lesson.blocks[0].durationMinutes).toBeCloseTo(1.5);
    });
  });
});
