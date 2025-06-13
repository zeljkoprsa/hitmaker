To combine your two separate GitHub repos (tryuseless.com site and metronome app) into a single Turborepo monorepo, follow this folder structure and migration plan:

⸻

Current scope:

# Plan to Make `apps/web` Work in Monorepo

## Notes
- The monorepo combines two previously separate repos: `hitmaker` (working, in `apps/hitmaker`) and the website (not working, in `apps/web`).
- The website's previous working version is still available in the `tryuseless.com` folder (one level up), with documentation in its `docs` subfolder.
- Current issue: `apps/web` only displays a single large image instead of the expected layout and content.
- Git history appears fine; the issue is with the current app behavior.
- Both `apps/web` and `tryuseless.com` have very similar directory structures and most config files are present in both.
- `package.json` files are nearly identical; only minor version differences (e.g., framer-motion).
- No `.env` files found in either project.
- `next.config.js` exists only in `apps/web` (monorepo), not in `tryuseless.com`.
- Prismic is the main CMS, and documentation outlines setup and troubleshooting steps.
- Architecture is modular with clear separation of concerns (pages, layouts, components, slices).
- Prismic integration and config files (`prismicio.ts`, `slicemachine.config.json`) are present and identical in both repos.

## Task List
- [x] Review the structure and dependencies of `apps/web` in the monorepo.
- [x] Compare `apps/web` with the original `tryuseless.com` repo for missing files/configuration.
- [x] Check for missing assets, components, or configuration differences (env, package.json, etc).
- [x] Review documentation in `tryuseless.com/docs` for migration or setup steps.
- [ ] Identify and document discrepancies or missing steps.
- [ ] Propose and implement fixes to make `apps/web` work as expected.

## Current Goal
Identify and document discrepancies or missing steps.

## Identified Issues and Fixes

1. **Path Alias Issue**: The monorepo version was using `@/` path aliases in import statements, but the files were not being correctly resolved.
   - **Fix**: Updated import paths in `Header.tsx` and `navigation-menu.tsx` to use relative paths instead of path aliases.

2. **CSS Class Issue**: The `AppLayout` component in the monorepo was using a hardcoded background color instead of the Tailwind class.
   - **Fix**: Changed `bg-[#242424]` to `bg-useless-dark` in the `AppLayout` component to match the original site.

## Implementation Steps Taken

1. Fixed the `AppLayout.tsx` component to use the proper Tailwind class for background color.
2. Updated import paths in `Header.tsx` to use relative paths instead of path aliases.
3. Updated import paths in `navigation-menu.tsx` to use relative paths instead of path aliases.

## Next Steps

1. Test the website to ensure all pages and components are working correctly.
2. Check for any remaining styling or layout issues.
3. Verify that the Prismic CMS integration is working properly.
4. Ensure that the monorepo setup allows for proper sharing of components between apps if needed.


✅ Final Folder Structure

useless/
├── apps/
│ ├── web/ # tryuseless.com site
│ └── hitmaker/ # metronome app
├── packages/ # optional: shared components, utils, config
│ └── ui/ # e.g. design system, if needed
├── .gitignore
├── turbo.json
└── vercel.json

⸻

🚀 Step-by-Step Migration Plan

1. Create a New Monorepo Repo
   • Create a new repo: tryuseless-monorepo or similar.
   • Clone it locally.

2. Move Existing Projects
   • From each of your old repos:

# In monorepo

mkdir -p apps/web
mkdir -p apps/hitmaker

    •	Copy files from:
    •	tryuseless.com → apps/web
    •	metronome app → apps/hitmaker

Clean out old .git, .vercel, README.md, etc., if present in copied folders.

3. Initialize Turborepo

npm create turbo@latest

# Or manually:

npm install --save-dev turbo

Create turbo.json:

{
"$schema": "https://turborepo.org/schema.json",
"pipeline": {
"build": {
"dependsOn": ["^build"],
"outputs": [".next/**", "dist/**"]
},
"dev": {
"cache": false
}
}
}

4. Add Vercel Config

vercel.json:

{
"rewrites": [
{ "source": "/", "destination": "/apps/web" },
{ "source": "/hitmaker", "destination": "/apps/hitmaker" }
]
}

Or, better: use project settings on Vercel to define each app’s root (apps/web, apps/hitmaker) and assign build outputs there.

5. Push Monorepo to GitHub

git init
git remote add origin git@github.com:yourname/tryuseless-monorepo.git
git add .
git commit -m "Initial monorepo setup with site and metronome app"
git push -u origin main

6. Configure Vercel
   • Import monorepo from GitHub.
   • Define two separate builds:
   • Project 1: apps/web → domain: tryuseless.com
   • Project 2: apps/hitmaker → path: /hitmaker or use rewrite to serve from root

⸻

Note: If both are Next.js apps, Turborepo will optimize build caching and dependency resolution. If they’re different frameworks (e.g. one is React+Vite, the other Next.js), Turborepo still works but you’ll manually define build steps in package.json and turbo.json.

⸻

Result: Clean monorepo, shared infra, deployable to Vercel without domain conflict.
