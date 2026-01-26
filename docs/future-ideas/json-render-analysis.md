# json-render Analysis for Hitmaker

**Date:** 2026-01-26
**Source:** https://json-render.dev/

## What is json-render?

A framework for AI-generated UIs with guardrails. You define a catalog of allowed components, users describe what they want in natural language, and AI generates JSON that renders only your pre-approved components. This prevents AI hallucinations and keeps output predictable.

### Core Workflow

1. **Define Catalog** - Developers specify which components, actions, and data bindings AI can use
2. **User Prompts** - End users describe desired interfaces naturally
3. **Render Output** - AI generates JSON constrained to the catalog; components render progressively

### Key Features

- Guardrails - AI can only use components you define
- Streaming - Progressive rendering as JSON streams
- Code Export - Export as standalone React code
- Data Binding - Two-way binding with JSON Pointer paths
- Actions & Visibility - Conditional rendering based on data or auth

---

## Potential Use Cases for Hitmaker

| Use Case | Description | Value | Fit |
|----------|-------------|-------|-----|
| **Custom practice layouts** | Users describe their ideal interface ("big BPM display, minimal controls") | Medium | Medium |
| **Preset generator** | "Create a jazz swing practice setup at 140 BPM" generates tempo + time signature + sound presets | High | High |
| **Accessibility customization** | "Make everything larger with high contrast" | Medium | Medium |
| **Practice routine builder** | "Build a warmup routine: start at 60 BPM, increase by 5 every minute" | High | High |

---

## Pros

- Differentiating feature for a metronome app
- Natural language interaction is intuitive for musicians
- You control exactly what can be generated (safe)
- Could export practice routines as shareable configs

## Cons

- Adds significant complexity for a focused app
- Requires AI API costs
- Current UI is already clean and usable
- Might be overkill for core metronome functionality

---

## Verdict

The strongest fit would be a **practice routine builder** - letting users describe tempo progressions, practice plans, or custom presets in natural language. This adds real value without overcomplicating the core metronome UI.

**Priority:** Future feature, not immediate priority.

---

## Implementation Notes (for later)

- Define a component catalog for: BPM control, time signature, sound selector, beat visualizer
- Define actions for: start/stop, tempo change, preset save
- Consider data bindings for: current tempo, beat count, practice duration
- Explore streaming for real-time UI adjustments during practice
