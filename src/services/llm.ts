import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { AiReviewCommentSchema } from '../schemas';
import { AiReviewComment } from '../types';
import { logger } from '../utils/logger';

export async function* getLLMReviewStream(diff: string): AsyncGenerator<AiReviewComment, void, unknown> {
  logger.info({ diffLength: diff.length }, 'Initiating LLM review stream');

  const { elementStream } = streamObject({
    model: google('gemini-2.5-flash'),
    output: 'array',
    schema: AiReviewCommentSchema,
    prompt: `You are an expert software engineer and code reviewer. Review the PROVIDED pull request diff.

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
  });

  let commentCount = 0;
  for await (const element of elementStream) {
    commentCount++;
    logger.debug({ commentId: element.id, severity: element.severity }, 'Yielding AI review comment');
    yield element;
  }

  logger.info({ totalComments: commentCount }, 'LLM review stream completed');
}
