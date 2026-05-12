# AI-Powered Code Review Tool

An intelligent code review assistant powered by Next.js and AI, designed to provide contextual feedback on GitHub Pull Requests.

## 🚀 Key Features

- **Automated PR Analysis:** Fetches GitHub diffs and analyzes them using advanced LLM logic.
- **Streaming Feedback:** Review comments appear in real-time as they are generated.
- **Intelligent Context:** Understands file paths, line numbers, and code context.
- **Shorthand Inputs:** Supports `owner/repo#123` or just `#123` with a configured default repo.
- **Comprehensive Testing:** Robust test coverage across Unit, Integration, and E2E layers.

## 🛠 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) with Google Gemini
- **Validation:** [Zod](https://zod.dev/)
- **Logging:** [Pino](https://github.com/pinojs/pino)
- **Testing:** [Vitest](https://vitest.dev/) & [Cypress](https://www.cypress.io/)
- **Formatting:** [Prettier](https://prettier.io/) & [ESLint](https://eslint.org/)

## 🏗 Architecture

The project adheres to strict software engineering principles:
- **Single Responsibility Principle (SRP):** UI is decoupled from business logic. Logic is encapsulated in custom hooks and services.
- **Loose Coupling:** Components are presentational; orchestration happens at the hook/action layer.
- **Centralized Types:** All shared interfaces are maintained in `src/types`.
- **Validation Boundaries:** External data (API responses, form inputs) is validated via Zod schemas.

## 🧪 Testing

We maintain a high-quality codebase through a multi-layered testing strategy:

- **Unit Tests:** `npm run test` (Vitest) - logic, hooks, and UI components.
- **Integration Tests:** `npm run test:run` - focuses on service orchestration and full action flows.
- **E2E Tests:** `npm run cypress:run` - critical user paths in a real browser.

### Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript compiler check
- `npm run cypress:open`: Open Cypress Test Runner
- `npm run cypress:run`: Run Cypress tests headlessly

## 📚 Documentation

The codebase is fully documented using **TSDoc**. Each function, hook, component, and type definition includes clear descriptions, parameter details, and return values. This ensures high maintainability and ease of onboarding.

## 🏁 Local Setup

1. **Clone & Install:**
   ```bash
   git clone <repo-url>
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env.local` file with:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
   ```

3. **Run:**
   ```bash
   npm run dev
   ```
