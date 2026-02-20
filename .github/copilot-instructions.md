# AI Coding Agent Instructions - React Todo List V4

## Project Overview

This is a **progressive curriculum project in the form of a todo app** with 11 lesson branches that build incrementally from basic React concepts to full-stack authentication. Each branch represents a student's weekly progress through Code The Dream's React curriculum.

## Critical Architecture Patterns

### Linear Branch Strategy

- **11 lesson branches** (01-setup → 11-deployment-security) build on each other linearly
- Changes propagate forward using `./scripts/propagate-changes.sh forward [branch]`
- **NEVER** make changes directly on advanced branches - always start from the earliest affected lesson
- Each branch represents a specific learning milestone with targeted features

### Project Structure Evolution

```
src/
├── App.jsx                    # Main app with auth state management
├── shared/                    # Reusable components (Header, TextInputWithLabel)
├── features/                  # Feature-based organization
│   ├── Logon.jsx             # Authentication components
│   └── Todos/                # Todo management feature
│       ├── TodosPage.jsx     # Main todo container with API calls
│       ├── TodoForm.jsx      # Form component
│       └── TodoList/         # List components
├── utils/                     # Utility functions (todoValidation.js)
└── pages/                     # Page-level routing components
```

### API Integration Patterns

- Uses **optimistic updates** - UI updates for working with todos are applied immediately, rolls back on API failure
- Uses **pessimistic updates** - UI updates for user authentication, logging out apply only after recieving a response from the API.
- CSRF token authentication via `X-CSRF-TOKEN` header
- Base URL from `VITE_BASE_URL` environment variable
- Error handling with user-friendly messages and rollback mechanisms

## Essential Development Workflows

### Making Changes

```bash
# ALWAYS start from earliest affected lesson
git checkout 02-components-jsx
# Make your changes
git commit -m "Add TodoForm component"
# Propagate forward to all subsequent lessons
./scripts/propagate-changes.sh forward 02-components-jsx
```

### Branch Management

- Use `./scripts/propagate-changes.sh status` to see all lesson states
- Use `./scripts/propagate-changes.sh create-branches` to create missing branches
- Script handles merge conflicts gracefully - stops and provides clear next steps

### Development Commands

- `npm run dev` - Vite dev server (port 5173)
- `npm run lint:fix` - Auto-fix ESLint + Prettier issues
- `npm run format` - Format all files with Prettier

## Code Conventions

### Component Organization

- **Feature-based folders** (`features/Todos/`) not component types
- **Shared components** in `src/shared/` for reusable UI elements
- **Page components** handle routing and top-level state
- **Utility functions** isolated in `src/utils/`

### State Management Patterns

- Props drilling for simple state (early lessons)
- Local state with `useState` for component-specific data
- **Optimistic updates** for all API mutations
- **Pessimistic updates** for auth/logoff

### API Error Handling

```jsx
// Pattern used throughout TodosPage.jsx
try {
  // Optimistic update first
  setTodoList(optimisticUpdate);
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(response.message);
} catch (error) {
  setError(`Error: ${error.message}`);
  setTodoList(rollbackState); // Rollback optimistic update
}
```

## Environment Setup

- Copy `.env.example` to `.env` and configure:
  - `VITE_BASE_URL` - Backend API base URL
  - `VITE_RECAPTCHA_SITE_KEY` - For authentication (lesson 11)
- Modern ESLint config with Prettier integration
- Vite + React with fast refresh

## Educational Context

This codebase prioritizes **progressive learning** over production patterns. When suggesting changes:

- Consider which lesson introduces the concept
- Maintain backward compatibility with earlier lessons
- Use clear, commented code for educational value
- Prefer explicit patterns over clever abstractions

## Assignment Drafting Guidelines

- Draft assignments with a focus on the differences between the previous week's branch and the current week's branch
- Use minimal examples

When drafting student assignments, follow this established structure and style:

### Assignment Structure Pattern

```markdown
### Expected App Capabilities

[Clear list of what the app should do after completing the week]

### Instructions Part 1: [Core Development Task]

#### Version Control Preparation (Only include for weeks 1-2)

- Merge previous week's PR
- Create new branch: week-XX-[topic]

### Instructions Part 2-4: [Core Development Tasks]

### [Specific Task Name]

[Step-by-step instructions focusing on what to implement rather than showing complete code. Include file paths, function names, and expected behavior. Reserve code examples only for complex syntax or entirely new concepts students haven't encountered.]

### Instructions Part 5: Final Testing & Submission

#### Test Your Application

#### Version Control Submission (Only include for weeks 1-2)

### What You Accomplished This Week

[Bulleted list of achievements with ✅]

### Looking Ahead

[Brief preview of next concepts]
```

### Assignment Writing Conventions

- **Progressive difficulty**: Each week builds on previous concepts
- **Minimal code examples**: Provide clear instructions instead of full code blocks. Use code examples sparingly - only for confusing syntax, complex implementations, or entirely new concepts students haven't seen
- **Descriptive instructions**: Tell students what to implement rather than showing complete code. Focus on file locations, function names, parameter descriptions, and expected behavior
- **Error acknowledgment**: Mention expected errors and why they occur
- **Console exploration**: Include console.log examples for learning when demonstrating new debugging techniques
- **Accessibility focus**: Use proper labels, htmlFor attributes
- **Version control workflow**: Consistent branch naming (week-XX-topic) - only include for weeks 1-2
- **User experience**: Focus on input focus, form validation, error handling
- **Visual verification**: Include screenshots showing expected results

### Key Educational Patterns from Curriculum

- **Guided discovery**: Students implement features step-by-step with explanations
- **Error normalization**: Acknowledge that errors are part of learning
- **Immediate feedback**: Test after each major change
- **Real-world practices**: Version control, code organization, accessibility
- **Incremental complexity**: Introduce a limited number of new concepts per week maximum

## Course Outline for "Looking Ahead" Sections

When writing "Looking Ahead" sections, reference this progression:

- **Week-00**: Course Orientation and Local Environment Setup
- **Week-01**: Intro to React, App Installation, and Working with Vite
- **Week-02**: ReactDOM, Components, JSX, and Troubleshooting
- **Week-03**: Component Lifecycle, Basic Hooks, State, and Props
- **Week-04**: Hooks Continued, Events and Handlers
- **Week-05**: Local State and Controlled Components, and Forms
- **Week-06**: Re-usable Components, Helper Functions and Hooks, Project Organization, and Refactoring
- **Week-07**: Data Fetching and UI Update Strategies
- **Week-08**: Advanced Hooks: useCallback and useMemo, Optimizing a React App, and API-based Sort/Search
- **Week-09**: Advanced State, useReducer, and useContext
- **Week-10**: React Router
- **Week-11**: Polishing an App for Your Portfolio, App and Data Security, and Deploying a React App
