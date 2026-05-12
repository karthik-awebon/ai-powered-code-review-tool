'use client';

import { useState, FormEvent } from 'react';
import { submitPRReview } from '../../app/actions/review';
import { AiReviewComment as AiReviewCommentType } from '../../types';
import { ReviewComment } from '../ui/ReviewComment';

export function ReviewForm() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<AiReviewCommentType[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setComments([]);

    try {
      const result = await submitPRReview(url);
      
      if ('error' in result) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // result is AsyncIterable<AiReviewComment>
      // We iterate over the stream
      for await (const comment of result) {
        setComments((prev) => [...prev, comment]);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

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
          disabled={loading}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#2ea043',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Reviewing...' : 'Review PR'}
        </button>
      </form>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#ffebe9', color: '#cf222e', borderRadius: '6px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div>
        {comments.map((comment) => (
          <ReviewComment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
