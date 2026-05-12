'use server';

import { parseGitHubPRUrl, fetchPRDiff } from '../../services/github';
import { simulateLLMReviewStream } from '../../services/llm';
import { AiReviewComment } from '../../types';

export async function submitPRReview(url: string): Promise<AsyncIterable<AiReviewComment> | { error: string }> {
  const prDetails = parseGitHubPRUrl(url);
  if (!prDetails) {
    return { error: 'Invalid GitHub PR URL' };
  }

  try {
    const diff = await fetchPRDiff(prDetails.owner, prDetails.repo, prDetails.pullNumber);
    // Returning the async generator directly to stream to the client
    return simulateLLMReviewStream(diff);
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch PR diff' };
  }
}
