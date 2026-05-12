import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewForm } from '../components/features/ReviewForm';
import { useDefaultRepo } from '../hooks/useDefaultRepo';
import { useRecentReviews } from '../hooks/useRecentReviews';
import { submitPRReview } from '../app/actions/review';
import { mockAiReviewComments } from '../__mocks__/reviewMocks';

// Mock the server action
vi.mock('../app/actions/review', () => ({
  submitPRReview: vi.fn(),
}));

// Mock storage hooks to avoid side effects
vi.mock('../hooks/useDefaultRepo', () => ({
  useDefaultRepo: vi.fn(),
}));

vi.mock('../hooks/useRecentReviews', () => ({
  useRecentReviews: vi.fn(),
}));

describe('UI Integration: Full Review Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useDefaultRepo as any).mockReturnValue({
      defaultRepo: 'owner/repo',
      saveDefaultRepo: vi.fn(),
      isLoaded: true,
    });

    (useRecentReviews as any).mockReturnValue({
      recentReviews: [],
      addRecentReview: vi.fn(),
      isLoaded: true,
    });
  });

  it('should flow from input to displaying comments', async () => {
    // 1. Setup mock stream
    const mockStream = (async function* () {
      yield mockAiReviewComments[0];
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
      yield mockAiReviewComments[1];
    })();

    vi.mocked(submitPRReview).mockResolvedValue(mockStream as any);

    // 2. Render the component
    render(<ReviewForm />);

    // 3. Enter PR information
    const input = screen.getByPlaceholderText(/e.g. owner\/repo#123/);
    fireEvent.change(input, { target: { value: 'owner/repo#123' } });

    // 4. Submit
    const submitBtn = screen.getByText('Review PR');
    fireEvent.click(submitBtn);

    // 5. Verify loading state
    expect(screen.getByText(/Fetching PR...|Analyzing code.../i)).toBeInTheDocument();

    // 6. Verify first comment appears
    await waitFor(() => {
      expect(screen.getByText(mockAiReviewComments[0].content)).toBeInTheDocument();
    }, { timeout: 2000 });

    // 7. Verify second comment appears eventually
    await waitFor(() => {
      expect(screen.getByText(mockAiReviewComments[1].content)).toBeInTheDocument();
    }, { timeout: 2000 });

    // 8. Verify status change to 'done' (button returns to 'Review PR')
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Review PR' })).toBeInTheDocument();
      expect(screen.queryByText(/Analyzing.../i)).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Verify all comments are rendered
    expect(screen.getByText(mockAiReviewComments[0].content)).toBeInTheDocument();
    expect(screen.getByText(mockAiReviewComments[1].content)).toBeInTheDocument();
  });

  it('should handle and display errors from the server action', async () => {
    // 1. Mock an error response
    vi.mocked(submitPRReview).mockResolvedValue({ error: 'API Rate limit exceeded' });

    // 2. Render
    render(<ReviewForm />);

    // 3. Submit
    const input = screen.getByPlaceholderText(/e.g. owner\/repo#123/);
    fireEvent.change(input, { target: { value: 'owner/repo#123' } });
    fireEvent.click(screen.getByText('Review PR'));

    // 4. Verify error message
    await waitFor(() => {
      expect(screen.getByText('API Rate limit exceeded')).toBeInTheDocument();
    });
  });
});
