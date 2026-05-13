'use server';

import { parsePRInput, fetchPRDiff, publishPRReview } from '../../services/github';
import { getLLMReviewStream } from '../../services/llm';
import { AiReviewComment } from '../../types';
import { logger } from '../../utils/logger';
import { auth } from '../../auth';

/**
 * Server action to initiate a pull request review.
 * Parses the input, fetches the PR diff from GitHub, and returns an AI review stream.
 * 
 * @param input - The GitHub PR URL, shorthand (owner/repo#123), or PR number if defaultRepo is provided.
 * @param defaultRepo - Optional default repository URL to use for shorthand resolution.
 * @returns An AsyncIterable that yields AiReviewComment objects, or an error object if the process fails.
 */
export async function submitPRReview(input: string, defaultRepo?: string): Promise<AsyncIterable<AiReviewComment> | { error: string }> {
  logger.info({ input, defaultRepo }, 'Starting PR review submission');

  const prDetails = parsePRInput(input, defaultRepo);
  if (!prDetails) {
    logger.warn({ input, defaultRepo }, 'Invalid PR input provided');
    return { error: 'Invalid GitHub PR input format' };
  }

  try {
    const session = await auth();
    const accessToken = session?.accessToken;

    logger.info({ ...prDetails, authenticated: !!accessToken }, 'Fetching PR diff');
    const diff = await fetchPRDiff(prDetails.owner, prDetails.repo, prDetails.pullNumber, accessToken);

    logger.info('PR diff fetched successfully, starting LLM review stream');
    return getLLMReviewStream(diff);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch PR diff';
    logger.error({ error: errorMessage, input }, 'Failed to complete PR review');
    return { error: errorMessage };
  }
}

/**
 * Server action to publish AI review comments to a GitHub pull request.
 * 
 * @param input - The GitHub PR URL, shorthand (owner/repo#123), or PR number if defaultRepo is provided.
 * @param comments - Array of AI review comments to publish.
 * @param defaultRepo - Optional default repository URL to use for shorthand resolution.
 * @returns An object indicating success or failure.
 */
export async function publishReviewAction(input: string, comments: AiReviewComment[], defaultRepo?: string): Promise<{ success?: boolean; error?: string }> {
  logger.info({ input, defaultRepo, commentsCount: comments.length }, 'Starting PR review publish action');

  const session = await auth();
  const accessToken = session?.accessToken;

  if (!accessToken) {
    logger.warn('Unauthorized attempt to publish PR review');
    return { error: 'You must be signed in to publish reviews to GitHub.' };
  }

  const prDetails = parsePRInput(input, defaultRepo);
  if (!prDetails) {
    logger.warn({ input, defaultRepo }, 'Invalid PR input provided for publishing');
    return { error: 'Invalid GitHub PR input format' };
  }

  try {
    await publishPRReview(prDetails.owner, prDetails.repo, prDetails.pullNumber, accessToken, comments);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to publish PR review';
    logger.error({ error: errorMessage, input }, 'Failed to complete PR review publish action');
    return { error: errorMessage };
  }
}
