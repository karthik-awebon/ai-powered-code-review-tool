'use server';

import { parsePRInput, fetchPRDiff } from '../../services/github';
import { getLLMReviewStream } from '../../services/llm';
import { AiReviewComment } from '../../types';
import { logger } from '../../utils/logger';

export async function submitPRReview(input: string, defaultRepo?: string): Promise<AsyncIterable<AiReviewComment> | { error: string }> {
  logger.info({ input, defaultRepo }, 'Starting PR review submission');

  const prDetails = parsePRInput(input, defaultRepo);
  if (!prDetails) {
    logger.warn({ input, defaultRepo }, 'Invalid PR input provided');
    return { error: 'Invalid GitHub PR input format' };
  }

  try {
    logger.info({ ...prDetails }, 'Fetching PR diff');
    const diff = await fetchPRDiff(prDetails.owner, prDetails.repo, prDetails.pullNumber);

    logger.info({ diff }, 'PR diff fetched successfully, starting LLM review stream');
    return getLLMReviewStream(diff);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch PR diff';
    logger.error({ error: errorMessage, input }, 'Failed to complete PR review');
    return { error: errorMessage };
  }
}
