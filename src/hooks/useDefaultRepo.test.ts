import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDefaultRepo } from './useDefaultRepo';

describe('useDefaultRepo', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with empty string if nothing in localStorage', () => {
    const { result } = renderHook(() => useDefaultRepo());
    expect(result.current.defaultRepo).toBe('');
    expect(result.current.isLoaded).toBe(true);
  });

  it('initializes with value from localStorage', () => {
    localStorage.setItem('ai_pr_review_default_repo', 'owner/repo');
    const { result } = renderHook(() => useDefaultRepo());
    expect(result.current.defaultRepo).toBe('owner/repo');
  });

  it('saves default repo to localStorage', () => {
    const { result } = renderHook(() => useDefaultRepo());
    
    act(() => {
      result.current.saveDefaultRepo('new/repo');
    });

    expect(result.current.defaultRepo).toBe('new/repo');
    expect(localStorage.getItem('ai_pr_review_default_repo')).toBe('new/repo');
  });

  it('removes default repo from localStorage if empty string is saved', () => {
    localStorage.setItem('ai_pr_review_default_repo', 'owner/repo');
    const { result } = renderHook(() => useDefaultRepo());

    act(() => {
      result.current.saveDefaultRepo('  ');
    });

    expect(result.current.defaultRepo).toBe('');
    expect(localStorage.getItem('ai_pr_review_default_repo')).toBeNull();
  });

  it('handles localStorage errors gracefully during initialization', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useDefaultRepo());
    
    expect(result.current.defaultRepo).toBe('');
    expect(warnSpy).toHaveBeenCalled();

    getItemSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
