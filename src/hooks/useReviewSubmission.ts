import { useState } from 'react';
import { submitPRReview } from '../app/actions/review';
import { AiReviewComment } from '../types';
import { parsePRInput } from '../services/github';
import { ERROR_MESSAGES } from '../constants';

export type SubmissionStatus = 'idle' | 'fetching' | 'generating' | 'done';

interface ErrorState {
  message: string;
  actionableHint?: string;
  isRetriable: boolean;
}

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
 * - `error`: Error state if the submission failed, otherwise null.
 * - `comments`: Accumulating array of AI review comments.
 * - `submitReview`: Async function to initiate the review process for a given URL or shorthand.
 * - `retry`: Function to re-attempt the last submission (if retriable).
 * - `clearError`: Function to reset the error state.
 * - `isWorking`: Boolean indicating if a process is currently active.
 */
export function useReviewSubmission({ defaultRepo, onSuccess }: UseReviewSubmissionProps) {
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [error, setError] = useState<ErrorState | null>(null);
  const [comments, setComments] = useState<AiReviewComment[]>([]);
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState('');

  const categorizeError = (errorMessage: string): ErrorState => {
    const lowerMsg = errorMessage.toLowerCase();
    
    // AI Service Rate Limit or High Demand (our internal ERROR_MESSAGES.LLM_BUSY)
    if (lowerMsg.includes('high demand') || lowerMsg.includes('try again later')) {
      return {
        message: errorMessage,
        actionableHint: 'The AI service is currently experiencing high demand. Please try again in a few moments.',
        isRetriable: true
      };
    }

    // GitHub or general Rate Limit
    if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests')) {
      return {
        message: errorMessage,
        actionableHint: 'Rate limit exceeded. Please wait a few minutes and try again.',
        isRetriable: true
      };
    }
    
    if (lowerMsg.includes('not found') || lowerMsg.includes('404')) {
      return {
        message: errorMessage,
        actionableHint: 'The Pull Request or Repository was not found. Please check the URL and ensure the repository is public.',
        isRetriable: false
      };
    }
    
    // Default fallback
    return {
      message: errorMessage,
      isRetriable: true
    };
  };

  const submitReview = async (url: string) => {
    if (!url) return;

    const prDetails = parsePRInput(url, defaultRepo);
    if (!prDetails) {
      setError({
        message: 'Invalid PR input.',
        actionableHint: 'Please provide a valid GitHub URL, shorthand (owner/repo#123), or configure a default repository and use #123.',
        isRetriable: false
      });
      return;
    }

    setLastSubmittedUrl(url);
    setStatus('fetching');
    setError(null);
    setComments([]);

    try {
      const result = await submitPRReview(url, defaultRepo);
      
      if ('error' in result) {
        setError(categorizeError(result.error || ERROR_MESSAGES.UNKNOWN));
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
      setError(categorizeError(errorMessage));
      setStatus('idle');
    }
  };

  const retry = () => {
    if (lastSubmittedUrl && error?.isRetriable) {
      submitReview(lastSubmittedUrl);
    }
  };

  const clearError = () => setError(null);

  return {
    status,
    error,
    comments,
    submitReview,
    retry: error?.isRetriable ? retry : undefined,
    clearError,
    isWorking: status === 'fetching' || status === 'generating'
  };
}
