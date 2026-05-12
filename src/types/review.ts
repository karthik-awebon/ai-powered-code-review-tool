import { z } from 'zod';
import { AiReviewCommentSchema, PRReviewRequestSchema } from '../schemas';

export type AiReviewComment = z.infer<typeof AiReviewCommentSchema>;
export type PRReviewRequest = z.infer<typeof PRReviewRequestSchema>;

export interface RecentReview {
  id: string; // e.g. "owner/repo#123"
  owner: string;
  repo: string;
  pullNumber: number;
  inputString: string;
  timestamp: number;
}
