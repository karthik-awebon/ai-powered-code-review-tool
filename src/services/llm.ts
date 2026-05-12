import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';
import { AiReviewCommentSchema } from '../schemas';
import { AiReviewComment } from '../types';
import { logger } from '../utils/logger';
import { extractSnippetFromDiff } from '../utils/diff';
import { APP_CONFIG, ERROR_MESSAGES } from '../constants';

export async function* getLLMReviewStream(diff: string): AsyncGenerator<AiReviewComment, void, unknown> {
  logger.info({ diffLength: diff.length }, 'Initiating LLM review stream');

  try {
    const { elementStream } = streamObject({
      model: google(APP_CONFIG.LLM.MODEL),
      output: 'array',
      schema: AiReviewCommentSchema,
      temperature: APP_CONFIG.LLM.DEFAULT_TEMPERATURE,
      prompt: APP_CONFIG.LLM.PROMPT(diff),
    });

    let commentCount = 0;
    for await (const element of elementStream) {
      commentCount++;
      const diffSnippet = extractSnippetFromDiff(diff, element.filePath, element.lineNumber);
      if (diffSnippet) {
        element.diffSnippet = diffSnippet;
      }
      logger.debug({ commentId: element.id, severity: element.severity }, 'Yielding AI review comment');
      yield element;
    }

    logger.info({ totalComments: commentCount }, 'LLM review stream completed');
  } catch (error: any) {
    logger.error({ 
      error: error.message, 
      name: error.name,
      statusCode: error.statusCode,
      stack: error.stack 
    }, 'LLM review stream encountered an error');

    // Handle high demand (503) or specific retry errors
    if (
      error.statusCode === 503 || 
      error.message?.toLowerCase().includes('high demand') || 
      error.message?.toLowerCase().includes('try again later') ||
      error.name === 'AI_RetryError'
    ) {
      throw new Error(ERROR_MESSAGES.LLM_BUSY);
    }

    // Fallback for other LLM-related failures
    throw new Error(ERROR_MESSAGES.LLM_FAILED);
  }
}
