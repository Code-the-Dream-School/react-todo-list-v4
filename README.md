# React Todo List V4 (Work in Progress)

This repo contains an example todo list project that intro to React mentors may use as a reference to evaluate student work. Each branch represents the end state of the student's weekly progress through the curriculum.

## Running this Application

### Prerequisites

- Node.js (version 18 or higher)
- npm
- Git

### Installation

1. Clone the repository
2. Install dependencies
3. Start the development server `npm run dev`
4. Open your browser to `http://localhost:5173`

## Contributing to This Project

### Initial Setup for Contributors

1. **Fork and clone** the repository
2. **Install dependencies**

### Contributor Workflow

1. **Choose the appropriate lesson branch** based on what you're working on
2. **Make your changes** on that specific lesson branch
3. **Test your changes** locally
4. **Create pull requests** for the branches you've modified

### Best Practices for Contributors

- **Work on individual lesson branches** rather than propagating changes
- **Test thoroughly** on each branch you modify
- **Write clear commit messages** that explain the educational purpose
- **Document new concepts** in code comments for student clarity
- **Keep lesson-specific features** isolated to appropriate branches
- **Update README** if you add new concepts or change the structure

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

#### Updating Shared Components

```bash
# Update component on each lesson that uses it
git checkout 02-components-jsx
# ... update shared component
git commit -m "Improve TextInputWithLabel props interface"

git checkout 03-basic-hooks-state
# ... update component usage for this lesson's context
git commit -m "Update TextInputWithLabel usage with hooks"

# Continue for other lessons that use the component...
```

## Syncing Fixed Files Across Branches

To keep tooling configuration, documentation, and environment examples consistent across all lesson branches, use the fixed-file sync script:

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

**Scope:** This script automates sync of `.gitignore`, `.prettierrc`, `package.json`, `README.md`, and other fixed files listed in `maintenance/sync-fixed-files.js`.

## Curriculum Structure

This project contains lesson branches that represent different stages of React learning. Each branch shows the expected state of a student's project at the end of each week.

### Lesson Branches

The curriculum progresses through these branches:

- **01-setup** - Project setup and basic structure
- **02-components-jsx** - React components and JSX
- **03-basic-hooks-state** - useState and basic hooks
- **04-events** - Event handling and form interactions
- **05-controlled-form** - Controlled components and forms
- **06-project-organization** - Code organization and structure
- **07-data-fetching** - API integration and data management
- **08-optimization-hooks** - Performance optimization hooks
- **09-advanced-state** - Advanced state management patterns
- **10-react-router** - Client-side routing
- **11-deployment-security** - Production deployment and security

### Working with Lesson Branches

Each lesson branch represents a complete, working application at that learning stage. When contributing:

1. **Check out the specific lesson branch** you need to work on
2. **Make changes appropriate for that lesson's complexity level**
3. **Test thoroughly** to ensure the lesson works as expected
4. **Repeat for other relevant lessons** if the change applies to multiple lessons
