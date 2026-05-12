import { z } from 'zod';
import { AiReviewCommentSchema, PRReviewRequestSchema } from '../schemas';

export type AiReviewComment = z.infer<typeof AiReviewCommentSchema>;
export type PRReviewRequest = z.infer<typeof PRReviewRequestSchema>;
