import { useState } from 'react';
import { submitPRReview } from '../app/actions/review';
import { AiReviewComment } from '../types';
import { parsePRInput } from '../services/github';
import { ERROR_MESSAGES } from '../constants';

export type SubmissionStatus = 'idle' | 'fetching' | 'generating' | 'done';

interface UseReviewSubmissionProps {
  defaultRepo: string;
  onSuccess?: (details: { owner: string; repo: string; pullNumber: number; inputString: string }) => void;
}

/**
 * Hook to manage the submission process of a pull request for AI review.
 * Coordinates fetching PR data, streaming AI comments, and handling error/success states.
 * 
 * @param props - Configuration for the hook.
 * @param props.defaultRepo - The default repository URL to use for shorthand inputs.
 * @param props.onSuccess - Optional callback triggered when the review submission starts successfully.
 * @returns An object containing:
 * - `status`: Current stage of the submission ('idle', 'fetching', 'generating', 'done').
 * - `error`: Error message if the submission failed, otherwise null.
 * - `comments`: Accumulating array of AI review comments.
 * - `submitReview`: Async function to initiate the review process for a given URL or shorthand.
 * - `retry`: Function to re-attempt the last submission.
 * - `clearError`: Function to reset the error state.
 * - `isWorking`: Boolean indicating if a process is currently active.
 */
export function useReviewSubmission({ defaultRepo, onSuccess }: UseReviewSubmissionProps) {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<AiReviewComment[]>([]);
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState('');

  const submitReview = async (url: string) => {
    if (!url) return;

    const prDetails = parsePRInput(url, defaultRepo);
    if (!prDetails) {
      setError('Invalid PR input. Please provide a valid GitHub URL, shorthand (owner/repo#123), or configure a default repository and use #123.');
      return;
    }

    setLastSubmittedUrl(url);
    setStatus('fetching');
    setError(null);
    setComments([]);

    try {
      const result = await submitPRReview(url, defaultRepo);
      
      if ('error' in result) {
        setError(result.error || ERROR_MESSAGES.UNKNOWN);
        setStatus('idle');
        return;
      }

      onSuccess?.({
        ...prDetails,
        inputString: url
      });

      setStatus('generating');
      for await (const comment of result) {
        setComments((prev) => [...prev, comment]);
      }
      setStatus('done');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.UNKNOWN;
      setError(errorMessage);
      setStatus('idle');
    }
  };

  const retry = () => {
    if (lastSubmittedUrl) {
      submitReview(lastSubmittedUrl);
    }
  };

  const clearError = () => setError(null);

  return {
    status,
    error,
    comments,
    submitReview,
    retry,
    clearError,
    isWorking: status === 'fetching' || status === 'generating'
  };
}
