import { SubdivisionType, TimeSignature } from '../types/MetronomeTypes';
import { SessionBlock, SessionBlockType, SessionSection } from '../types/SessionTypes';

/**
 * Markdown → lesson importer (spec #8). Deterministic, no AI: seven documented
 * rules (docs/lesson-markdown-notation.md). Ambiguity degrades to visible
 * prose plus a warning — the draft is always produced, nothing is dropped,
 * and nothing here throws on malformed input.
 */

export interface ParsedLesson {
  name: string;
  lessonNumber?: string;
  sections: SessionSection[];
  blocks: SessionBlock[];
}

export interface LessonImportResult {
  lesson: ParsedLesson;
  warnings: string[];
}

/** `[teach]` / `[do]` / `[break]` / `[break 30s]` heading suffix. */
const MARKER_RE = /\s*\[(teach|do|break)(?:\s+([\d.]+)\s*(min|s))?\]\s*$/i;

/** Working block: directive fields land here before defaults resolve. */
interface WorkingBlock {
  id: string;
  label?: string;
  typeOverride?: SessionBlockType;
  tempo?: number;
  tempoRangeHigh?: number;
  timeSignature?: TimeSignature;
  subdivision?: SubdivisionType;
  durationMinutes?: number;
  eyebrow?: string;
  items: Array<{ text: string; note?: string }>;
  proseLines: string[];
  /** null = structural / sectionless */
  sectionId: string | null;
}

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';

/** `- Text — note`: the first spaced em/en dash (or ` -- `) splits the note. */
const splitItem = (raw: string): { text: string; note?: string } => {
  const m = raw.match(/^(.*?)\s+(?:—|–|--)\s+(.*)$/);
  if (m && m[1].trim()) return { text: m[1].trim(), note: m[2].trim() };
  return { text: raw.trim() };
};

const stripMarker = (
  raw: string
): { text: string; type?: SessionBlockType; durationMinutes?: number } => {
  const m = raw.match(MARKER_RE);
  if (!m) return { text: raw.trim() };
  const type = m[1].toLowerCase() as SessionBlockType;
  let durationMinutes: number | undefined;
  if (m[2]) {
    const n = parseFloat(m[2]);
    if (!isNaN(n) && n > 0) durationMinutes = m[3].toLowerCase() === 's' ? n / 60 : n;
  }
  return { text: raw.replace(MARKER_RE, '').trim(), type, durationMinutes };
};

/** Parse an `@` directive into the block. Returns leftover text that matched
 *  no rule (reported as a warning by the caller). */
const applyDirective = (line: string, block: WorkingBlock): string => {
  let rest = line.replace(/^@\s*/, '');

  const range = rest.match(/(\d+)\s*(?:—|–|-)\s*(\d+)\s*bpm/i);
  if (range) {
    block.tempo = parseInt(range[1], 10);
    block.tempoRangeHigh = parseInt(range[2], 10);
    rest = rest.replace(range[0], ' ');
  } else {
    const bpm = rest.match(/(\d+)\s*bpm/i);
    if (bpm) {
      block.tempo = parseInt(bpm[1], 10);
      rest = rest.replace(bpm[0], ' ');
    }
  }

  const sig = rest.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (sig) {
    block.timeSignature = { beats: parseInt(sig[1], 10), noteValue: parseInt(sig[2], 10) };
    rest = rest.replace(sig[0], ' ');
  }

  const sub = rest.match(/\b(quarter|eighth|triplet|sixteenth)s?\b/i);
  if (sub) {
    block.subdivision = sub[1].toLowerCase() as SubdivisionType;
    rest = rest.replace(sub[0], ' ');
  }

  const min = rest.match(/([\d.]+)\s*min\b/i);
  if (min) {
    const n = parseFloat(min[1]);
    if (!isNaN(n) && n > 0) block.durationMinutes = n;
    rest = rest.replace(min[0], ' ');
  } else {
    const sec = rest.match(/(\d+)\s*s(?:ec(?:onds?)?)?\b/i);
    if (sec) {
      block.durationMinutes = parseInt(sec[1], 10) / 60;
      rest = rest.replace(sec[0], ' ');
    }
  }

  return rest.replace(/[·|,]/g, ' ').trim();
};

export const parseLessonMarkdown = (
  markdown: string,
  newId: () => string = () => crypto.randomUUID()
): LessonImportResult => {
  const warnings: string[] = [];
  const sections: Array<SessionSection & { eyebrow?: string }> = [];
  const blocks: WorkingBlock[] = [];

  let name = '';
  let lessonNumber: string | undefined;
  let currentSection: (SessionSection & { eyebrow?: string }) | null = null;
  let currentBlock: WorkingBlock | null = null;
  let inPreamble = true;

  const sectionIds = new Set<string>();
  const uniqueSectionId = (base: string): string => {
    let id = base;
    let n = 2;
    while (sectionIds.has(id)) id = `${base}-${n++}`;
    sectionIds.add(id);
    return id;
  };

  const openBlock = (init: Partial<WorkingBlock>): WorkingBlock => {
    const block: WorkingBlock = {
      id: newId(),
      items: [],
      proseLines: [],
      sectionId: currentSection?.id ?? null,
      ...init,
    };
    blocks.push(block);
    currentBlock = block;
    return block;
  };

  /** Content with no `###` under a `##` lands in one implicit block named
   *  after the section — simple lessons stay simple. */
  const ensureBlock = (): WorkingBlock => {
    if (currentBlock) return currentBlock;
    return openBlock({ label: currentSection?.name });
  };

  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    const lineNo = index + 1;
    if (!line) return;

    // # Lesson name (first one wins; extras degrade to sections)
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      if (!name) {
        name = stripMarker(h1[1]).text;
      } else {
        warnings.push(`Line ${lineNo}: extra "#" heading — treated as a section.`);
        const { text } = stripMarker(h1[1]);
        currentSection = { id: uniqueSectionId(slugify(text)), name: text, blockIds: [] };
        sections.push(currentSection);
        currentBlock = null;
      }
      return;
    }

    // Preamble "Lesson 02" / "№ 02" → lesson number
    if (inPreamble) {
      const num = line.match(/^(?:lesson\s+|№\s*)(\S+)$/i);
      if (num) {
        lessonNumber = num[1];
        return;
      }
    }

    // ## Section
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2 && !line.startsWith('###')) {
      inPreamble = false;
      const { text } = stripMarker(h2[1]);
      currentSection = { id: uniqueSectionId(slugify(text)), name: text, blockIds: [] };
      sections.push(currentSection);
      currentBlock = null;
      return;
    }

    // ### Block
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      inPreamble = false;
      const { text, type, durationMinutes } = stripMarker(h3[1]);
      openBlock({ label: text, typeOverride: type, durationMinutes });
      return;
    }

    // --- structural break; also closes the current section, so following
    // blocks (e.g. a Mission outro) are sectionless
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      inPreamble = false;
      currentSection = null;
      openBlock({ label: 'Rest', typeOverride: 'break' });
      currentBlock = null;
      return;
    }

    // @ directive
    if (line.startsWith('@')) {
      inPreamble = false;
      const leftover = applyDirective(line, ensureBlock());
      if (leftover) {
        warnings.push(`Line ${lineNo}: "${leftover}" in directive not understood — ignored.`);
      }
      return;
    }

    // ^ eyebrow override
    if (line.startsWith('^')) {
      inPreamble = false;
      ensureBlock().eyebrow = line.replace(/^\^\s*/, '');
      return;
    }

    // - item (— note)
    const item = line.match(/^[-*]\s+(.+)$/);
    if (item) {
      inPreamble = false;
      ensureBlock().items.push(splitItem(item[1]));
      return;
    }

    // > prose
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      inPreamble = false;
      if (quote[1].trim()) ensureBlock().proseLines.push(quote[1].trim());
      return;
    }

    // Anything else: visible prose on the current block, never dropped
    inPreamble = false;
    ensureBlock().proseLines.push(line);
    warnings.push(`Line ${lineNo}: "${line}" not recognized — kept as prose.`);
  });

  if (!name) {
    name = 'Imported Lesson';
    warnings.push('No "# Title" heading found — lesson named "Imported Lesson".');
  }

  const finalBlocks: SessionBlock[] = blocks.map(w => {
    const type: SessionBlockType = w.typeOverride ?? (w.tempo !== undefined ? 'do' : 'teach');
    const proseLines = [...w.proseLines];
    if (w.tempoRangeHigh !== undefined) {
      proseLines.push(`Work the range ${w.tempo}–${w.tempoRangeHigh} BPM.`);
    }
    const section = w.sectionId ? sections.find(s => s.id === w.sectionId) : undefined;
    const eyebrow = w.eyebrow ?? (type !== 'break' ? section?.name.toLowerCase() : undefined);
    const hasContent = w.items.length > 0 || proseLines.length > 0 || Boolean(eyebrow);

    const block: SessionBlock = {
      id: w.id,
      durationMinutes: w.durationMinutes ?? (type === 'break' ? 0.5 : 3),
    };
    if (w.label) block.label = w.label;
    block.type = type;
    if (type !== 'break') {
      if (w.tempo !== undefined) block.tempo = w.tempo;
      if (w.timeSignature) block.timeSignature = w.timeSignature;
      if (w.subdivision) block.subdivision = w.subdivision;
    }
    if (hasContent && type !== 'break') {
      block.content = {
        ...(eyebrow ? { eyebrow } : {}),
        ...(w.items.length > 0 ? { items: w.items } : {}),
        ...(proseLines.length > 0 ? { prose: proseLines.join('\n') } : {}),
      };
    }
    return block;
  });

  const finalSections: SessionSection[] = [];
  for (const s of sections) {
    const blockIds = blocks.filter(b => b.sectionId === s.id).map(b => b.id);
    if (blockIds.length === 0) {
      warnings.push(`Section "${s.name}" has no blocks — dropped.`);
      continue;
    }
    finalSections.push({ id: s.id, name: s.name, blockIds });
  }

  return {
    lesson: {
      name,
      ...(lessonNumber ? { lessonNumber } : {}),
      sections: finalSections,
      blocks: finalBlocks,
    },
    warnings,
  };
};
