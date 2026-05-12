'use server';

import { parseGitHubPRUrl, fetchPRDiff } from '../../services/github';
import { getLLMReviewStream } from '../../services/llm';
import { AiReviewComment } from '../../types';
import { logger } from '../../utils/logger';

export async function submitPRReview(url: string): Promise<AsyncIterable<AiReviewComment> | { error: string }> {
  logger.info({ url }, 'Starting PR review submission');

  const prDetails = parseGitHubPRUrl(url);
  if (!prDetails) {
    logger.warn({ url }, 'Invalid GitHub PR URL provided');
    return { error: 'Invalid GitHub PR URL' };
  }

  try {
    logger.info({ ...prDetails }, 'Fetching PR diff');
    const diff = await fetchPRDiff(prDetails.owner, prDetails.repo, prDetails.pullNumber);

    logger.info({ diff }, 'PR diff fetched successfully, starting LLM review stream');
    return getLLMReviewStream(diff);
  } catch (error: any) {
    logger.error({ error: error.message, url }, 'Failed to complete PR review');
    return { error: error.message || 'Failed to fetch PR diff' };
  }
}
