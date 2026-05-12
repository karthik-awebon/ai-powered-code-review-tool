'use client';

import { useState, FormEvent, useMemo } from 'react';
import { submitPRReview } from '../../app/actions/review';
import { AiReviewComment as AiReviewCommentType } from '../../types';
import { ReviewComment } from '../ui/ReviewComment';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonComment } from '../ui/SkeletonComment';
import { ErrorMessage } from '../ui/ErrorMessage';
import { ERROR_MESSAGES } from '../../constants';

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

  const handleSubmit = async (e?: FormEvent, retryUrl?: string) => {
    e?.preventDefault();
    const targetUrl = retryUrl || url;
    if (!targetUrl) return;

    setLastSubmittedUrl(targetUrl);
    console.log('[ReviewForm] Submitting URL:', targetUrl);
    setStatus('fetching');
    setError(null);
    setComments([]);

    try {
      const result = await submitPRReview(targetUrl);
      
      if ('error' in result) {
        console.error('[ReviewForm] Error from server action:', result.error);
        setError(result.error || ERROR_MESSAGES.UNKNOWN);
        setStatus('idle');
        return;
      }

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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo/pull/123"
          required
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '6px',
            border: '1px solid #d0d7de',
            fontSize: '16px',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)'
          }}
        />
        <button
          type="submit"
          disabled={isWorking}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#2ea043',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: isWorking ? 'not-allowed' : 'pointer',
            opacity: isWorking ? 0.7 : 1
          }}
        >
          {buttonText}
        </button>
      </form>

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
