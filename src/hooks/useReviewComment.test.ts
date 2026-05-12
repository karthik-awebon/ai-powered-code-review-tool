import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useReviewComment } from './useReviewComment';
import { mockAiReviewComment } from '../__mocks__/reviewMocks';

describe('useReviewComment', () => {
  it('initializes as expanded for high confidence', () => {
    const comment = { ...mockAiReviewComment, confidence: 0.9 };
    const { result } = renderHook(() => useReviewComment(comment));
    expect(result.current.isCollapsed).toBe(false);
  });

  it('initializes as collapsed for low confidence', () => {
    const comment = { ...mockAiReviewComment, confidence: 0.3 };
    const { result } = renderHook(() => useReviewComment(comment));
    expect(result.current.isCollapsed).toBe(true);
  });

  it('toggles collapse state', () => {
    const comment = { ...mockAiReviewComment, confidence: 0.9 };
    const { result } = renderHook(() => useReviewComment(comment));
    
    act(() => {
      result.current.toggleCollapse();
    });
    expect(result.current.isCollapsed).toBe(true);

    act(() => {
      result.current.toggleCollapse();
    });
    expect(result.current.isCollapsed).toBe(false);
  });

  it('calculates confidence percentage correctly', () => {
    const comment = { ...mockAiReviewComment, confidence: 0.856 };
    const { result } = renderHook(() => useReviewComment(comment));
    expect(result.current.confidencePercentage).toBe(86);
  });

  it('copies to clipboard successfully', async () => {
    const comment = mockAiReviewComment;
    const { result } = renderHook(() => useReviewComment(comment));
    
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    const mockEvent = { stopPropagation: vi.fn() } as any;
    
    let success;
    await act(async () => {
      success = await result.current.copyToClipboard(mockEvent);
    });

    expect(success).toBe(true);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('handles clipboard error', async () => {
    const comment = mockAiReviewComment;
    const { result } = renderHook(() => useReviewComment(comment));
    
    const mockClipboard = {
      writeText: vi.fn().mockRejectedValue(new Error('Fail')),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockEvent = { stopPropagation: vi.fn() } as any;
    
    let success;
    await act(async () => {
      success = await result.current.copyToClipboard(mockEvent);
    });

    expect(success).toBe(false);
  });
});
