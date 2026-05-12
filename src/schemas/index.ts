import { z } from 'zod';

/**
 * Zod schema for an AI-generated review comment.
 */
export const AiReviewCommentSchema = z.object({
  /** Unique identifier for the comment. */
  id: z.string(),
  /** Path to the file being reviewed. */
  filePath: z.string(),
  /** The line number the comment refers to. */
  lineNumber: z.number().int().positive(),
  /** The actual feedback content. */
  content: z.string(),
  /** AI's confidence score in this feedback (0.0 to 1.0). */
  confidence: z.number().min(0).max(1),
  /** The severity level of the issue identified. */
  severity: z.enum(['suggestion', 'warning', 'critical']),
  /** Optional snippet of the diff associated with the comment. */
  diffSnippet: z.string().optional(),
});

/**
 * Zod schema for the PR review request, validating the input URL.
 */
export const PRReviewRequestSchema = z.object({
  /** The full URL of the GitHub Pull Request. */
  url: z.string().url(),
});
