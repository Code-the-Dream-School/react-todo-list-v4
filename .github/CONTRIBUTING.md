# Contributing to React Todo List V4

## About This Repository

### About the App

This repository contains an example todo list project used as a reference for Code the Dream's intro to React curriculum. Mentors use it to evaluate student work at each stage of the course. Each branch represents the approximate end state of a student's project at the end of a specific lesson week, progressing from basic React setup through deployment and security.

### Coding Approach

This project is intentionally designed for **educational clarity** rather than production patterns — explicit, well-commented code is preferred over clever abstractions.

### Version Control Strategy

This repo uses a branch-per-lesson version control strategy.

- `01-setup` through `11-deployment-security` are each a snapshot of the application code as it should be at the conclusion of the assignment for that lesson.
- `deploy` is reserved for a hosted version of the app that includes registration functionality for students to create an account.

If a fix applies to multiple lessons, start on the earliest affected branch and then manually carry the change forward (or use `git cherry-pick` if appropriate) branch-by-branch so each lesson stays accurate for its learning stage. If you cannot make PRs to all branches affected, open an issue ticket instead of submitting a PR for partial work.

Any changes to documentation or maintenance scripts must remain synced between all branches. This repo provides maintenance scripts described in the [Maintenance Scripts](#maintenance-scripts) section to automate syncing.

## Developer Workflow

### Initial Setup for Contributors

1. **Fork and clone** the repository
2. **Install dependencies**
3. **Install repository git hooks** so pre-commit reminders are enabled:

```bash
npm run hooks:install
```

4. **Sync local branches with GitHub** after setup:

```bash
npm run sync:from-origin
```

`sync:from-origin` is the recommended starting command for this repo. Most changes eventually propagate across multiple lesson branches, and this keeps local branches current to speed up branch-to-branch development.

Note: `sync:fixed-files` and `sync:from-origin` are designed to run through npm scripts, so executable permissions on `maintenance/sync-fixed-files.js` are not required.

### Contributor Workflow

1. **Choose the appropriate lesson branch** based on what you're working on
2. **Make your changes** on that specific lesson branch
3. **Test your changes** locally
4. **Create pull requests** for each of the branches you've modified

### Best Practices for Contributors

- **Test thoroughly** on each branch you modify
- **Write clear commit messages** that explain the educational purpose
- **Keep lesson-specific features** isolated to appropriate branches
- **Update README** if you add new concepts or change the structure
- **Sync documentation and maintenance scripts** to **all** branches.

### Common Scenarios

#### Adding a New Feature to Multiple Lessons

```bash
# Add feature to each relevant lesson individually
git checkout 04-events
# ... make changes appropriate for this lesson level
git commit -m "Add form validation for todo input"

git checkout 05-controlled-form
# ... make changes appropriate for this lesson level
git commit -m "Add form validation with controlled components"

# Continue for other relevant lessons...
```

#### Fixing a Bug Across Multiple Lessons

```bash
# Fix on each affected lesson branch individually
git checkout 03-basic-hooks-state
# ... fix bug
git commit -m "Fix accessibility issue in todo checkbox"

git checkout 04-events
# ... fix same bug, adapted for this lesson's code structure
git commit -m "Fix accessibility issue in todo checkbox"

# Continue for other affected lessons...
```

## Maintenance Scripts

### Propagate Fixed Files Across Branches (`sync:fixed-files`)

To keep tooling, documentation, repository automation files, and maintenance files consistent across lesson branches, use the fixed-file sync script.

```bash
npm run sync:fixed-files
```

### Usage (`sync:fixed-files`)

```bash
# Validate changes before applying
npm run sync:fixed-files -- --dry-run

# Sync locally (no GitHub push)
npm run sync:fixed-files -- --local

# Sync and push to GitHub (default)
npm run sync:fixed-files
```

**Options:**

- `--dry-run`: Show what would change without modifying branches.
- `--local`: Sync locally without pushing to GitHub.
- `--force`: Override working tree cleanliness check.

**Scope:** This script syncs files matched by `isFixedFile` in `maintenance/fixed-files-config.js`. That includes explicit files in `FIXED_FILES` plus files under configured fixed directories such as `maintenance/`, `.githooks/`, and `.github/`.

### Update Local Lesson Branches From Origin (`sync:from-origin`)

This command fetches from `origin`, then fast-forwards `main` and all lesson branches locally. If a local lesson branch does not exist yet, it creates a local tracking branch from `origin/<branch>` before syncing. It supports this repo's branch-per-lesson version-control model by keeping every curriculum branch aligned with GitHub before you start or review work.

Recommended first step:

```bash
npm run sync:from-origin
```

### Usage (`sync:from-origin`)

```bash
# Update all local lesson branches from origin
npm run sync:from-origin
```

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

## Reporting Issues

If you find a bug or have a suggestion, please open an issue describing the problem and the lesson branch(es) it affects.
