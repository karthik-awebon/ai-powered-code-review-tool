import { z } from 'zod';

/**
 * Zod schema for environment variable validation.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/**
 * Validated environment variables.
 */
const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL,
});

/**
 * Global application configuration object containing environment info,
 * GitHub API settings, LLM parameters, and review thresholds.
 */
export const APP_CONFIG = {
  env,
  isDev: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
  isProd: env.NODE_ENV === 'production',
  GITHUB: {
    BASE_URL: 'https://api.github.com',
    API_VERSION: '2022-11-28',
    REVALIDATE_SECONDS: 60,
  },
  LLM: {
    MODEL: 'gemini-2.5-flash',
    DEFAULT_TEMPERATURE: 0.1,
    /**
     * Generates the system prompt for the LLM based on the provided code diff.
     * @param diff - The git diff content to review.
     * @returns A formatted prompt string for the AI model.
     */
    PROMPT: (diff: string) => `You are an expert software engineer and code reviewer. Review the PROVIDED pull request diff.

CRITICAL INSTRUCTIONS:
1. Review the ENTIRE diff. Do not stop after finding one issue.
2. Provide feedback for EACH distinct logical change or issue you identify across all files in the diff.
3. If a PR has multiple changes (e.g., across different files or sections), you should aim to provide multiple relevant comments.
4. For each comment:
   - Provide the exact file path and line number from the diff.
   - Assign a confidence score (0.0 to 1.0).
   - Set severity ('suggestion', 'warning', 'critical').
   - Generate a unique 'id'.

Focus on bugs, code quality, consistency, security, and performance.
If the changes are mostly correct, you can still provide suggestions for improvement or highlight specific areas of concern.

Diff to review:
\n\n${diff}\n\n`,
  },
  REVIEW: {
    CONFIDENCE_THRESHOLDS: {
      LOW: 0.5,
      MEDIUM: 0.8,
    },
    DIFF_CONTEXT_LINES: 3,
  },
} as const;

/**
 * Application route definitions.
 */
export const ROUTES = {
  HOME: '/',
} as const;

/**
 * Standardized error messages displayed to the user.
 */
export const ERROR_MESSAGES = {
  INVALID_URL: 'Invalid GitHub PR URL provided.',
  FETCH_FAILED: 'Failed to retrieve the pull request details. Please check the URL and your connection.',
  LLM_FAILED: 'An error occurred while analyzing the code. Please try again.',
  LLM_BUSY: 'The AI service is currently experiencing high demand. Please try again in a moment.',
  UNKNOWN: 'An unexpected error occurred. Please try again later.',
} as const;
