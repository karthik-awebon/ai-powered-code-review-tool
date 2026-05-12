import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ai_pr_review_default_repo';

/**
 * Hook to manage the default GitHub repository URL in localStorage.
 * Provides the current default repo, a function to save it, and a loading state.
 * 
 * @returns An object containing:
 * - `defaultRepo`: The current default repository URL from localStorage.
 * - `saveDefaultRepo`: A function to update and persist the default repository URL.
 * - `isLoaded`: A boolean indicating if the initial value has been loaded from localStorage.
 */
export function useDefaultRepo() {
  const [defaultRepo, setDefaultRepo] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDefaultRepo(stored);
      }
    } catch (e) {
      console.warn('Failed to read default repo from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  const saveDefaultRepo = (repo: string) => {
    try {
      const trimmed = repo.trim();
      setDefaultRepo(trimmed);
      if (trimmed) {
        localStorage.setItem(STORAGE_KEY, trimmed);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to save default repo to localStorage', e);
    }
  };

  return { defaultRepo, saveDefaultRepo, isLoaded };
}
