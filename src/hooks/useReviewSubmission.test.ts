import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReviewSubmission } from './useReviewSubmission';
import { submitPRReview } from '../app/actions/review';
import { parsePRInput } from '../services/github';
import { mockAiReviewComments } from '../__mocks__/reviewMocks';

vi.mock('../app/actions/review', () => ({
  submitPRReview: vi.fn(),
}));

vi.mock('../services/github', () => ({
  parsePRInput: vi.fn(),
}));

describe('useReviewSubmission', () => {
  const defaultRepo = 'owner/repo';
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(submitPRReview).mockResolvedValue({} as any);
  });

  it('initializes with idle status', () => {
    const { result } = renderHook(() => useReviewSubmission({ defaultRepo }));
    expect(result.current.status).toBe('idle');
    expect(result.current.comments).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('sets error for invalid PR input', async () => {
    vi.mocked(parsePRInput).mockReturnValue(null);
    const { result } = renderHook(() => useReviewSubmission({ defaultRepo }));
    
    await act(async () => {
      await result.current.submitReview('invalid');
    });

    expect(result.current.error?.message).toContain('Invalid PR input');
    expect(result.current.status).toBe('idle');
  });

  it('successfully submits and streams comments', async () => {
    vi.mocked(parsePRInput).mockReturnValue({ owner: 'owner', repo: 'repo', pullNumber: 123 });
    const mockStream = (async function* () {
      for (const comment of mockAiReviewComments) {
        yield comment;
      }
    })();

    vi.mocked(submitPRReview).mockResolvedValue(mockStream as any);

    const { result } = renderHook(() => useReviewSubmission({ defaultRepo, onSuccess }));
    
    await act(async () => {
      await result.current.submitReview('valid-url');
    });

    expect(result.current.status).toBe('done');
    expect(result.current.comments).toHaveLength(mockAiReviewComments.length);
    expect(onSuccess).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pullNumber: 123,
      inputString: 'valid-url'
    });
  });

  it('handles error from submitPRReview result', async () => {
    vi.mocked(parsePRInput).mockReturnValue({ owner: 'owner', repo: 'repo', pullNumber: 123 });
    vi.mocked(submitPRReview).mockResolvedValue({ error: 'Server error' });

    const { result } = renderHook(() => useReviewSubmission({ defaultRepo }));
    
    await act(async () => {
      await result.current.submitReview('valid-url');
    });

    expect(result.current.error?.message).toBe('Server error');
    expect(result.current.status).toBe('idle');
  });

  it('handles thrown error during submission', async () => {
    vi.mocked(parsePRInput).mockReturnValue({ owner: 'owner', repo: 'repo', pullNumber: 123 });
    vi.mocked(submitPRReview).mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useReviewSubmission({ defaultRepo }));
    
    await act(async () => {
      await result.current.submitReview('valid-url');
    });

    expect(result.current.error?.message).toBe('Network failure');
    expect(result.current.status).toBe('idle');
  });

  it('retries submission', async () => {
    vi.mocked(parsePRInput).mockReturnValue({ owner: 'owner', repo: 'repo', pullNumber: 123 });
    vi.mocked(submitPRReview).mockRejectedValueOnce(new Error('First fail'))
                          .mockResolvedValueOnce((async function* () {})() as any);

    const { result } = renderHook(() => useReviewSubmission({ defaultRepo }));
    
    await act(async () => {
      await result.current.submitReview('valid-url');
    });

    expect(result.current.error?.message).toBe('First fail');

    await act(async () => {
      if (result.current.retry) {
        await result.current.retry();
      }
    });

    expect(submitPRReview).toHaveBeenCalledTimes(2);
  });
});
