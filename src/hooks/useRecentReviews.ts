import { useState, useEffect } from 'react';
import { RecentReview } from '../types';

const STORAGE_KEY = 'ai_pr_recent_reviews';
const MAX_RECENT = 5;

export function useRecentReviews() {
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentReviews(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to read recent reviews from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  const addRecentReview = (review: Omit<RecentReview, 'id' | 'timestamp'>) => {
    setRecentReviews((prev) => {
      const id = `${review.owner}/${review.repo}#${review.pullNumber}`;
      
      // Remove if it already exists to put it at the top
      const filtered = prev.filter(r => r.id !== id);
      
      const updated = [
        {
          ...review,
          id,
          timestamp: Date.now(),
        },
        ...filtered
      ].slice(0, MAX_RECENT); // Keep only max

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent reviews to localStorage', e);
      }

      return updated;
    });
  };

  const clearRecentReviews = () => {
    setRecentReviews([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear recent reviews from localStorage', e);
    }
  };

  return { recentReviews, addRecentReview, clearRecentReviews, isLoaded };
}
