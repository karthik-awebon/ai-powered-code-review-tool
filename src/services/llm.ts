import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { AiReviewCommentSchema } from '../schemas';
import { AiReviewComment } from '../types';

export async function* getLLMReviewStream(diff: string): AsyncGenerator<AiReviewComment, void, unknown> {
  const { elementStream } = streamObject({
    model: google('gemini-2.5-flash'),
    output: 'array',
    schema: AiReviewCommentSchema,
    prompt: `You are an expert software engineer and code reviewer. Review the following pull request diff.
For each relevant issue or suggestion you find, provide actionable feedback.
Provide the exact file path and line number from the diff where the issue exists.
Assign a confidence score between 0.0 and 1.0 (where 1.0 is highly confident).
Set severity to 'suggestion', 'warning', or 'critical'.
Generate a unique 'id' for each comment.

Focus on potential bugs, code quality, security, and performance. Do not be overly pedantic.
If there are no major issues, you can provide a suggestion or positive feedback.

Diff to review:
\n\n${diff}\n\n`,
  });

  for await (const element of elementStream) {
    yield element;
  }
}
