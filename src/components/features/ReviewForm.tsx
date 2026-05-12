'use client';

import { useState, FormEvent, useMemo } from 'react';
import { ReviewComment } from '../ui/ReviewComment';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonComment } from '../ui/SkeletonComment';
import { ErrorMessage } from '../ui/ErrorMessage';
import { parsePRInput } from '../../services/github';
import { useDefaultRepo } from '../../hooks/useDefaultRepo';
import { useRecentReviews } from '../../hooks/useRecentReviews';
import { useReviewSubmission } from '../../hooks/useReviewSubmission';
import { useReviewComments, SortOrder } from '../../hooks/useReviewComments';

/**
 * ReviewForm component that serves as the main entry point for the review process.
 * 
 * It manages the input for the GitHub Pull Request URL, handles the submission
 * workflow, and coordinates the display of results, loading states, and error messages.
 * It also provides filtering and sorting capabilities for the generated review comments.
 * 
 * @returns The complete review interface including input form and result display.
 */
export function ReviewForm() {
  const [url, setUrl] = useState('');

  const { defaultRepo, saveDefaultRepo, isLoaded: isRepoLoaded } = useDefaultRepo();
  const { recentReviews, addRecentReview, isLoaded: isReviewsLoaded } = useRecentReviews();

  const {
    status,
    error,
    comments,
    submitReview,
    retry,
    clearError,
    isWorking
  } = useReviewSubmission({
    defaultRepo,
    onSuccess: addRecentReview
  });

  const {
    showOnlyCritical,
    setShowOnlyCritical,
    sortByConfidence,
    setSortByConfidence,
    groupedComments,
    hasComments
  } = useReviewComments(comments);

  // Inline Validation State
  const parsedInput = useMemo(() => parsePRInput(url, defaultRepo), [url, defaultRepo]);

  const handleSubmit = (e?: FormEvent, targetInput?: string) => {
    e?.preventDefault();
    submitReview(targetInput || url);
  };

  const handleExamplePR = () => {
    const example = 'vercel/next.js/pull/76505';
    setUrl(example);
    submitReview(example);
  };

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
                onClick={() => { setUrl(review.inputString); submitReview(review.inputString); }}
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
          onRetry={retry} 
          onClear={clearError} 
        />
      )}

      {hasComments && (
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
        {status === 'idle' && !hasComments && !error && <EmptyState />}
        
        {isWorking && !hasComments && (
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
