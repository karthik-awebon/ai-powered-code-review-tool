import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRecentReviews } from './useRecentReviews';
import { mockRecentReviews } from '../__mocks__/reviewMocks';

describe('useRecentReviews', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with empty array if nothing in localStorage', () => {
    const { result } = renderHook(() => useRecentReviews());
    expect(result.current.recentReviews).toEqual([]);
    expect(result.current.isLoaded).toBe(true);
  });

  it('initializes with values from localStorage', () => {
    localStorage.setItem('ai_pr_recent_reviews', JSON.stringify(mockRecentReviews));
    const { result } = renderHook(() => useRecentReviews());
    expect(result.current.recentReviews).toEqual(mockRecentReviews);
  });

  it('adds a recent review and keeps it within MAX_RECENT', () => {
    const { result } = renderHook(() => useRecentReviews());
    
    act(() => {
      result.current.addRecentReview({
        owner: 'o1',
        repo: 'r1',
        pullNumber: 1,
        inputString: 'o1/r1#1',
      });
    });

    expect(result.current.recentReviews).toHaveLength(1);
    expect(result.current.recentReviews[0].owner).toBe('o1');

    // Add more to hit limit (MAX_RECENT is 5)
    for (let i = 2; i <= 6; i++) {
      act(() => {
        result.current.addRecentReview({
          owner: `o${i}`,
          repo: `r${i}`,
          pullNumber: i,
          inputString: `o${i}/r${i}#${i}`,
        });
      });
    }

    expect(result.current.recentReviews).toHaveLength(5);
    expect(result.current.recentReviews[0].owner).toBe('o6'); // Last added is first
  });

  it('moves existing review to top when re-added', () => {
    localStorage.setItem('ai_pr_recent_reviews', JSON.stringify(mockRecentReviews));
    const { result } = renderHook(() => useRecentReviews());

    const existingReview = mockRecentReviews[1];
    
    act(() => {
      result.current.addRecentReview({
        owner: existingReview.owner,
        repo: existingReview.repo,
        pullNumber: existingReview.pullNumber,
        inputString: existingReview.inputString,
      });
    });

    expect(result.current.recentReviews[0].id).toBe(existingReview.id);
    expect(result.current.recentReviews).toHaveLength(mockRecentReviews.length);
  });

  it('clears all recent reviews', () => {
    localStorage.setItem('ai_pr_recent_reviews', JSON.stringify(mockRecentReviews));
    const { result } = renderHook(() => useRecentReviews());

    act(() => {
      result.current.clearRecentReviews();
    });

    expect(result.current.recentReviews).toEqual([]);
    expect(localStorage.getItem('ai_pr_recent_reviews')).toBeNull();
  });
});
