'use client';

import { useState, FormEvent, useMemo } from 'react';
import { submitPRReview } from '../../app/actions/review';
import { AiReviewComment as AiReviewCommentType } from '../../types';
import { ReviewComment } from '../ui/ReviewComment';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonComment } from '../ui/SkeletonComment';
import { ErrorMessage } from '../ui/ErrorMessage';
import { ERROR_MESSAGES } from '../../constants';
import { parsePRInput } from '../../services/github';
import { useDefaultRepo } from '../../hooks/useDefaultRepo';
import { useRecentReviews } from '../../hooks/useRecentReviews';

type Status = 'idle' | 'fetching' | 'generating' | 'done';
type SortOrder = 'none' | 'desc' | 'asc';

export function ReviewForm() {
  const [url, setUrl] = useState('');
  const [lastSubmittedUrl, setLastSubmittedUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<AiReviewCommentType[]>([]);
  
  // Filtering and Sorting State
  const [showOnlyCritical, setShowOnlyCritical] = useState(false);
  const [sortByConfidence, setSortByConfidence] = useState<SortOrder>('none');

  // New hooks
  const { defaultRepo, saveDefaultRepo, isLoaded: isRepoLoaded } = useDefaultRepo();
  const { recentReviews, addRecentReview, isLoaded: isReviewsLoaded } = useRecentReviews();

  // Inline Validation State
  const parsedInput = useMemo(() => parsePRInput(url, defaultRepo), [url, defaultRepo]);

  const handleSubmit = async (e?: FormEvent, targetInput?: string) => {
    e?.preventDefault();
    const finalInput = targetInput || url;
    if (!finalInput) return;

    // Validate using the same parser the server will use
    const prDetails = parsePRInput(finalInput, defaultRepo);
    if (!prDetails) {
      setError('Invalid PR input. Please provide a valid GitHub URL, shorthand (owner/repo#123), or configure a default repository and use #123.');
      return;
    }

    setLastSubmittedUrl(finalInput);
    console.log('[ReviewForm] Submitting PR:', finalInput);
    setStatus('fetching');
    setError(null);
    setComments([]);

    try {
      const result = await submitPRReview(finalInput, defaultRepo);
      
      if ('error' in result) {
        console.error('[ReviewForm] Error from server action:', result.error);
        setError(result.error || ERROR_MESSAGES.UNKNOWN);
        setStatus('idle');
        return;
      }

      // Record successful submission in history
      addRecentReview({
        owner: prDetails.owner,
        repo: prDetails.repo,
        pullNumber: prDetails.pullNumber,
        inputString: finalInput
      });

      console.log('[ReviewForm] Diff fetched, starting to process stream...');
      setStatus('generating');
      for await (const comment of result) {
        setComments((prev) => [...prev, comment]);
      }
      setStatus('done');
    } catch (err: any) {
      console.error('[ReviewForm] Unexpected error during submission:', err);
      setError(err.message || ERROR_MESSAGES.UNKNOWN);
      setStatus('idle');
    }
  };

  const handleRetry = () => {
    handleSubmit(undefined, lastSubmittedUrl);
  };

  const handleClearError = () => {
    setError(null);
  };

  const handleExamplePR = () => {
    const example = 'vercel/next.js/pull/76505';
    setUrl(example);
    handleSubmit(undefined, example);
  };

  // Derived state: Filter, Sort, and Group comments
  const groupedComments = useMemo(() => {
    let processed = comments;

    // Filter
    if (showOnlyCritical) {
      processed = processed.filter(c => c.severity === 'critical');
    }

    // Sort
    if (sortByConfidence !== 'none') {
      processed = [...processed].sort((a, b) => {
        if (sortByConfidence === 'desc') {
          return b.confidence - a.confidence;
        }
        return a.confidence - b.confidence;
      });
    }

    // Group by filePath
    const groups: Record<string, AiReviewCommentType[]> = {};
    processed.forEach(comment => {
      if (!groups[comment.filePath]) {
        groups[comment.filePath] = [];
      }
      groups[comment.filePath].push(comment);
    });

    return groups;
  }, [comments, showOnlyCritical, sortByConfidence]);

  const isWorking = status === 'fetching' || status === 'generating';
  
  let buttonText = 'Review PR';
  if (status === 'fetching') buttonText = 'Fetching PR...';
  if (status === 'generating') buttonText = 'Analyzing...';

  // Avoid hydration mismatch by waiting for localStorage to load
  if (!isRepoLoaded || !isReviewsLoaded) {
    return null;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '14px', fontWeight: 600 }}>Pull Request to Review</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ color: 'var(--foreground)' }}>Default Repo:</span>
          <input 
            type="text" 
            placeholder="owner/repo" 
            value={defaultRepo}
            onChange={(e) => saveDefaultRepo(e.target.value)}
            style={{ 
              padding: '4px 8px', 
              borderRadius: '4px', 
              border: '1px solid #d0d7de',
              width: '120px'
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. owner/repo#123 or https://github.com/..."
            required
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #d0d7de',
              fontSize: '16px',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
          {url && parsedInput && (
            <span style={{ fontSize: '12px', color: '#2ea043', marginTop: '4px', marginLeft: '4px' }}>
              ✓ Recognized: {parsedInput.owner}/{parsedInput.repo} #{parsedInput.pullNumber}
            </span>
          )}
          {url && !parsedInput && (
            <span style={{ fontSize: '12px', color: '#cf222e', marginTop: '4px', marginLeft: '4px' }}>
              ✗ Unrecognized format
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleExamplePR}
          disabled={isWorking}
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            border: '1px solid #d0d7de',
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isWorking ? 'not-allowed' : 'pointer',
            opacity: isWorking ? 0.7 : 1,
            height: 'fit-content'
          }}
        >
          Example PR
        </button>

        <button
          type="submit"
          disabled={isWorking || (!!url && !parsedInput)}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#2ea043',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: (isWorking || (!!url && !parsedInput)) ? 'not-allowed' : 'pointer',
            opacity: (isWorking || (!!url && !parsedInput)) ? 0.7 : 1,
            height: 'fit-content'
          }}
        >
          {buttonText}
        </button>
      </form>

      {recentReviews.length > 0 && (
        <div style={{ marginBottom: '24px', fontSize: '13px' }}>
          <span style={{ color: '#57606a', marginRight: '8px' }}>Recent:</span>
          <div style={{ display: 'inline-flex', gap: '8px', flexWrap: 'wrap' }}>
            {recentReviews.map(review => (
              <button
                key={review.id}
                type="button"
                onClick={() => { setUrl(review.inputString); handleSubmit(undefined, review.inputString); }}
                disabled={isWorking}
                style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid #d0d7de',
                  background: 'var(--background)',
                  cursor: isWorking ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  color: 'var(--foreground)'
                }}
              >
                {review.owner}/{review.repo}#{review.pullNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacing if no recent reviews */}
      {recentReviews.length === 0 && <div style={{ marginBottom: '24px' }}></div>}

      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={handleRetry} 
          onClear={handleClearError} 
        />
      )}

      {comments.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap', padding: '12px', backgroundColor: 'var(--background)', border: '1px solid #d0d7de', borderRadius: '6px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showOnlyCritical} 
              onChange={(e) => setShowOnlyCritical(e.target.checked)} 
            />
            Show Critical Only
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="sortConf">Sort by Confidence:</label>
            <select 
              id="sortConf"
              value={sortByConfidence} 
              onChange={(e) => setSortByConfidence(e.target.value as SortOrder)}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d0d7de' }}
            >
              <option value="none">None</option>
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
        </div>
      )}

      <div>
        {status === 'idle' && comments.length === 0 && !error && <EmptyState />}
        
        {isWorking && comments.length === 0 && (
          <>
            <SkeletonComment />
            <SkeletonComment />
            <SkeletonComment />
          </>
        )}

        {Object.entries(groupedComments).map(([filePath, fileComments]) => (
          <div key={filePath} style={{ marginBottom: '32px' }}>
            <h3 style={{ 
              marginBottom: '16px', 
              paddingBottom: '8px', 
              borderBottom: '1px solid #d0d7de',
              fontSize: '18px',
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {filePath}
            </h3>
            {fileComments.map((comment) => (
              <ReviewComment key={comment.id} comment={comment} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
