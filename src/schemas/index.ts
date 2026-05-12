import { z } from 'zod';

export const AiReviewCommentSchema = z.object({
  id: z.string(),
  filePath: z.string(),
  lineNumber: z.number().int().positive(),
  content: z.string(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['suggestion', 'warning', 'critical']),
});

export const PRReviewRequestSchema = z.object({
  url: z.string().url(),
});
