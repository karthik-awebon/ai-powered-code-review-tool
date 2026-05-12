'use client';

import { useState, FormEvent } from 'react';
import { submitPRReview } from '../../app/actions/review';
import { AiReviewComment as AiReviewCommentType } from '../../types';
import { ReviewComment } from '../ui/ReviewComment';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonComment } from '../ui/SkeletonComment';

type Status = 'idle' | 'fetching' | 'generating' | 'done';

export function ReviewForm() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<AiReviewCommentType[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;

    console.log('[ReviewForm] Submitting URL:', url);
    setStatus('fetching');
    setError(null);
    setComments([]);

    try {
      const result = await submitPRReview(url);
      
      if ('error' in result) {
        console.error('[ReviewForm] Error from server action:', result.error);
        setError(result.error);
        setStatus('idle');
        return;
      }

      console.log('[ReviewForm] Diff fetched, starting to process stream...');
      setStatus('generating');
      // result is AsyncIterable<AiReviewComment>
      // We iterate over the stream
      for await (const comment of result) {
        console.log('[ReviewForm] Received comment:', comment.id);
        setComments((prev) => [...prev, comment]);
      }
      console.log('[ReviewForm] Stream iteration complete');
      setStatus('done');
    } catch (err: any) {
      console.error('[ReviewForm] Unexpected error during submission:', err);
      setError(err.message || 'An unexpected error occurred.');
      setStatus('idle');
    }
  };

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
        <div style={{ padding: '12px', backgroundColor: '#ffebe9', color: '#cf222e', borderRadius: '6px', marginBottom: '24px' }}>
          {error}
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

        {comments.map((comment) => (
          <ReviewComment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
