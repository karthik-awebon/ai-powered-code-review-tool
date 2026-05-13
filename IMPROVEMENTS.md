1. Authentication & Private Repositories (High Impact)

- Current State: The app uses unauthenticated GitHub API requests, which limits you to 60 requests per hour and prevents
  reviewing private repositories.
- Improvement: Integrate NextAuth.js (Auth.js) using the GitHub Provider. Logging in would increase the user's GitHub API
  rate limit to 5,000 requests/hour and allow the app to fetch diffs for private repositories they have access to.

2. Actionable Feedback (Post directly to GitHub)

- Current State: AI comments are only displayed within your application's UI.
- Improvement: Once users are authenticated, add a "Publish to GitHub" button. By mapping the AI output (filePath and
  lineNumber) to GitHub's Review API (POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews), you can automatically post
  the AI suggestions directly onto the PR's timeline.

3. Handling Large Pull Requests (Scalability)

- Current State: The raw PR diff is passed directly into the Gemini prompt. Large PRs will likely exceed token limits,
  slow down generation, or cause server timeouts.
- Improvement:
  - Smart Filtering: Parse the diff (using a library like parse-diff) before sending it to the LLM to strip out
    auto-generated files (e.g., package-lock.json), binaries, or SVGs.
  - Chunking: Split massive PRs by file or module and process them in parallel streams.
  - Review Focus: Add a dropdown before submission allowing the user to set a "Focus Area" (e.g., Security, Performance,
    React Best Practices) to optimize the prompt and reduce noise.

4. Persistence & Caching

- Current State: Recent history is only saved in browser localStorage.
- Improvement: Introduce a lightweight database (e.g., Vercel KV, or PostgreSQL via Drizzle/Prisma).
  - Caching: Save the generated AI review against the latest commit hash of the PR. If a user requests a review for an
    unchanged PR, return the cached review instantly—saving Gemini API costs and reducing wait times.
  - Shareable Links: Support dynamic routing like /review/owner/repo/123 so a developer can share the AI's review page
    with a coworker.

5. UI/UX Refinements

- Current State: Diff snippets and markdown are rendered plainly.
- Improvement:
  - Integrate a syntax highlighter like Shiki or react-syntax-highlighter to render the diffSnippet with proper syntax
    colors.
  - Add a system-aware Dark/Light mode toggle.
