# Project Development Rules - AI-Powered Code Review Tool

This document outlines the foundational mandates and engineering standards for this project.

## Tech Stack & Environment

- **Framework:** Next.js 16 (App Router)
- **Library:** React 19
- **Language:** Strict TypeScript
- **Styling:** CSS Modules
- **Validation:** Zod
- **Testing:** Vitest (Unit/Integration), Cypress (E2E)
- **Logging:** Pino

## Architectural Directives

1.  **Single Responsibility Principle (SRP):**
    - Keep UI components thin and presentational.
    - Extract all business logic, data fetching, and state management into custom hooks (e.g., `src/hooks/`) or server actions (e.g., `src/app/actions/`).
2.  **Server-First Approach:**
    - Default to React Server Components (RSC).
    - Use `'use client'` only when strictly necessary for interactivity or browser-only APIs.
3.  **Type Safety:**
    - NEVER use `any`.
    - Use Zod schemas to validate external data at boundaries and infer TypeScript types from them.
4.  **Loose Coupling:**
    - Components must be decoupled. Use composition over deep configuration.
5.  **Documentation:**
    - All exported members (functions, components, hooks, interfaces) MUST have TSDoc/JSDoc comments.

## Testing Standards

1.  **Unit Tests:** Every hook, utility, and UI component should have a corresponding `.test.ts(x)` file in the same directory.
2.  **Integration Tests:** Focus on service orchestration and full action-to-UI flows (located in `src/test/`).
3.  **E2E Tests:** Use Cypress for critical user paths (located in `cypress/e2e/`).
4.  **Mocks:** Use the centralized mock data in `src/__mocks__` for consistency across test suites.

## Coding Style

- Follow Prettier and ESLint configurations strictly.
- Use functional components with arrow functions.
- Prefer descriptive variable names over abbreviations.
- Ensure proper error handling using the standardized `AppError` and `ErrorMessage` components.
