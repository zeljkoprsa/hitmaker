# Lesson Markdown Notation (spec #8)

The import convention, validated against the real curriculum files
(`curriculum/feet-dont-fail-me.html`, `lesson01.html`, and the seeded
Groove Is In The Heart). Deterministic — no AI. Anything unrecognized
lands in the draft as visible prose; nothing is dropped.

## The rules (memorize these seven)

| Markdown | Becomes |
|---|---|
| `# Title` | Lesson name. An optional `Lesson 02` / `№ 02` line right after sets the number. |
| `## Heading` | **Section** (pickable in the composer). |
| `### Heading` | **Block** inside the current section; label = heading text. |
| `@ 60bpm 4/4 eighth · 4min` | Directive line: metronome fields + duration for the current block. Any subset works (`@ 4min`, `@ 60bpm`). A range `@ 50–90bpm` sets the starting tempo to the low end and keeps the range as a note (spec #3 placeholder rule). |
| `- Text — note` | Card item; the ` — ` em-dash splits dimmed note from text. |
| `> Quote` | Prose line on the current block (mantras, "Just play. No judgment."). |
| `---` | Structural **break** block (30s, sectionless, never pickable). Also **closes the current section** — blocks after it are sectionless until the next `##` (how a Mission outro stays structural). |

Defaults: a block with a tempo directive is `do`; without one it's `teach`.
Override with `[teach]` / `[do]` / `[break]` (or `[break 45s]`) after the
heading text. Duration defaults: 3 min for teach/do, 30 s for breaks.
A range directive (`@ 50–120bpm`) sets the starting tempo to the low end
and appends "Work the range 50–120 BPM." to the block's prose.
List items directly under a `##` (no `###`) form one implicit block named
after the section — so simple lessons stay simple.
Eyebrow auto-derives from the section name; `^ custom eyebrow` overrides.
Unrecognized lines are kept as prose on the current block and reported —
never dropped, never a hard error.

## Example A — Groove Is In The Heart (round-trips the seeded lesson)

```markdown
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
- ♩ Quarters → ♪ Eighths → ♬ Sixteenths
- Accents · Dynamics · Ahead / Behind
- Even → Shuffle → Swing

---

### Mission [teach]
- Groove and flow above all
- Even strokes, even kicks, controlled dynamics
- Sing along & audiate while you play — bonus
> HAVE FUN ✦
```

(The Mission block is `[teach]` and would sit outside any section in the
editor — same structural role it has today.)

## Example B — one exercise from Feet Don't Fail Me (the richer real file)

```markdown
# Feet Don't Fail Me
Lesson 02

## Single Stroke Bass

### Isolate
@ 50–80bpm 4/4 quarter · 2min
- Heel-up position, ball of foot on the pedal — weight forward, ankle relaxed
- Single strokes, quarter notes at tempo — let the beater rebound fully
- Ankle pivot, not full leg — the thigh stays still
- Listen for the tone — released beater = round note; buried = dead thud
> Increase in +4 BPM steps only.

### Integrate
@ 50–80bpm 4/4 eighth · 2min
- Hi-hat: steady 8ths, right hand — mezzo piano, background texture
- Snare: backbeat on 2 and 4 — not loud
- Kick: continue single strokes on 1 and 3
- Test: drop the hands mid-bar — if the kick changes, slow down
> The foot leads. Everything starts from the ground.
```

The HTML files' insight tables (Released/Buried/This exercise) flatten to
`- Label — description` items — same information, card-shaped.
