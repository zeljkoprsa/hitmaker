To combine your two separate GitHub repos (tryuseless.com site and metronome app) into a single Turborepo monorepo, follow this folder structure and migration plan:

⸻

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
