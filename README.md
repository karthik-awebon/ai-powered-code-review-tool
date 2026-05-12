# AI-Powered Code Review Tool

An intelligent code review assistant powered by Next.js and AI.

## Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Validation:** [Zod](https://zod.dev/)
- **Logging:** [Pino](https://github.com/pinojs/pino)
- **Testing:** [Vitest](https://vitest.dev/)
- **Formatting & Linting:** [Prettier](https://prettier.io/), [ESLint](https://eslint.org/)
- **Git Hooks:** [Husky](https://typicode.github.io/husky/)

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd AI-Powered-Code-Review-Tool
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript compiler check
- `npm run test`: Run tests in watch mode
- `npm run test:run`: Run tests once
- `npm run test:ui`: Run tests with UI

## Architecture

This project follows a strict architectural pattern:
- **Single Responsibility Principle (SRP):** Components, hooks, and utilities are decoupled and focused.
- **Type Centralization:** All shared types are in `src/types`.
- **Validation Boundaries:** All external data is validated using Zod schemas in `src/schemas`.
- **Standardized Error Handling:** Centralized error management in `src/utils/errors.ts`.
