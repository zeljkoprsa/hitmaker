# Git Strategy for Metronome App

## Branching Model

We use a simplified Git flow with the following branches:

1. `main`: The primary branch containing production-ready code.
2. `develop`: The main development branch where features are integrated.
3. `feature/*`: Feature branches for new developments.
4. `bugfix/*`: Branches for bug fixes.
5. `release/*`: Branches for release preparations.

## Branch Naming Conventions

- Feature branches: `feature/issue-<number>-short-description`
- Bug fix branches: `bugfix/issue-<number>-description`
- Release branches: `release/vX.Y.Z`

## Workflow

1. Create a new branch from `develop` for each new feature or bug fix.
2. Make commits to your feature branch using the commit message format described below.
3. When the feature is complete, create a pull request to merge into `develop`.
4. After review and approval, merge the feature branch into `develop`.
5. Periodically, create a release branch from `develop` for release preparation.
6. After testing and finalizing the release, merge the release branch into both `main` and `develop`.

## Commit Message Format

Use the following format for commit messages:

```
<type>: <subject>

<body>

<footer>
```

- Types: feat, fix, docs, style, refactor, test, chore
- Subject: Short description of the change (max 50 chars)
- Body: Detailed explanation if necessary
- Footer: Reference issues, PRs, etc.

Example:
```
feat: add tap tempo functionality

Implemented tap tempo feature allowing users to set BPM by tapping a button.

Closes #123
```

## Pull Request Process

1. Ensure all tests pass and the code meets our style guidelines.
2. Update relevant documentation, including the changelog.
3. Get at least one code review before merging.
4. Use "Squash and merge" for cleaner history, unless discussed otherwise.

## Release Process

1. Create a release branch from `develop`.
2. Update version numbers and changelog.
3. Perform final testing and bug fixes in the release branch.
4. Merge release branch into `main` and tag the release.
5. Merge release branch back into `develop`.

Remember to adjust this strategy as needed based on your specific workflow and team preferences.