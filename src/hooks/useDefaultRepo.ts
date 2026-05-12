import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ai_pr_review_default_repo';

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
