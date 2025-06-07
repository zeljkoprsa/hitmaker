# Useless Monorepo

This monorepo contains the following projects:

- **tryuseless.com** - The main website (Next.js)
- **hitmaker** - Metronome app (React)

## Structure

```
useless/
├── apps/
│   ├── web/         # tryuseless.com site
│   └── hitmaker/    # metronome app
├── packages/
│   └── ui/          # shared UI components
├── .gitignore
├── turbo.json
└── vercel.json
```

## Audio Files

**Important:** The metronome app requires audio files that are not included in the Git repository due to their size. To set up the audio files:

1. Copy all `.wav` files from the original metronome project to `apps/hitmaker/public/assets/sounds/`
2. The following sound categories should be included:
   - Perc_* (percussion sounds)
   - Synth_* (synthesized sounds)

These files are excluded from Git tracking via `.gitignore` to keep the repository size manageable.
