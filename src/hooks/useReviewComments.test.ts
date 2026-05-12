import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useReviewComments } from './useReviewComments';
import { mockAiReviewComments } from '../__mocks__/reviewMocks';

describe('useReviewComments', () => {
  it('groups comments by filePath', () => {
    const { result } = renderHook(() => useReviewComments(mockAiReviewComments));
    
    expect(Object.keys(result.current.groupedComments)).toContain('src/app/page.tsx');
    expect(Object.keys(result.current.groupedComments)).toContain('src/utils/diff.ts');
  });

  it('filters critical comments only', () => {
    const { result } = renderHook(() => useReviewComments(mockAiReviewComments));
    
    act(() => {
      result.current.setShowOnlyCritical(true);
    });

    const filePaths = Object.keys(result.current.groupedComments);
    expect(filePaths).toHaveLength(1);
    expect(result.current.groupedComments[filePaths[0]][0].severity).toBe('critical');
  });

  it('sorts comments by confidence desc', () => {
    const { result } = renderHook(() => useReviewComments(mockAiReviewComments));
    
    act(() => {
      result.current.setSortByConfidence('desc');
    });

    // Flatten to check order
    const flattened = Object.values(result.current.groupedComments).flat();
    expect(flattened[0].confidence).toBeGreaterThanOrEqual(flattened[1].confidence);
  });

  it('sorts comments by confidence asc', () => {
    const { result } = renderHook(() => useReviewComments(mockAiReviewComments));
    
    act(() => {
      result.current.setSortByConfidence('asc');
    });

    const flattened = Object.values(result.current.groupedComments).flat();
    expect(flattened[0].confidence).toBeLessThanOrEqual(flattened[1].confidence);
  });

  it('reports hasComments correctly', () => {
    const { result: resultEmpty } = renderHook(() => useReviewComments([]));
    expect(resultEmpty.current.hasComments).toBe(false);

    const { result: resultWithData } = renderHook(() => useReviewComments(mockAiReviewComments));
    expect(resultWithData.current.hasComments).toBe(true);
  });
});
