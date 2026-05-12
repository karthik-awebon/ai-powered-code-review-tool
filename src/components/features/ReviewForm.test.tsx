import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReviewForm } from './ReviewForm';
import { useDefaultRepo } from '../../hooks/useDefaultRepo';
import { useRecentReviews } from '../../hooks/useRecentReviews';
import { useReviewSubmission } from '../../hooks/useReviewSubmission';
import { useReviewComments } from '../../hooks/useReviewComments';
import { parsePRInput } from '../../services/github';
import { mockRecentReviews, mockAiReviewComments } from '../../__mocks__/reviewMocks';

vi.mock('../../hooks/useDefaultRepo');
vi.mock('../../hooks/useRecentReviews');
vi.mock('../../hooks/useReviewSubmission');
vi.mock('../../hooks/useReviewComments');
vi.mock('../../services/github');

describe('ReviewForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(parsePRInput).mockImplementation((url) => 
      url.includes('valid') ? { owner: 'o', repo: 'r', pullNumber: 1 } : null
    );

    (useDefaultRepo as any).mockReturnValue({
      defaultRepo: 'owner/repo',
      saveDefaultRepo: vi.fn(),
      isLoaded: true,
    });
    
    (useRecentReviews as any).mockReturnValue({
      recentReviews: mockRecentReviews,
      addRecentReview: vi.fn(),
      isLoaded: true,
    });
    
    (useReviewSubmission as any).mockReturnValue({
      status: 'idle',
      error: null,
      comments: [],
      submitReview: vi.fn(),
      retry: vi.fn(),
      clearError: vi.fn(),
      isWorking: false,
    });
    
    (useReviewComments as any).mockReturnValue({
      showOnlyCritical: false,
      setShowOnlyCritical: vi.fn(),
      sortByConfidence: 'none',
      setSortByConfidence: vi.fn(),
      groupedComments: {},
      hasComments: false,
    });
  });

  it('renders correctly in idle state', () => {
    render(<ReviewForm />);
    expect(screen.getByPlaceholderText(/e.g. owner\/repo#123/)).toBeInTheDocument();
    expect(screen.getByText('Review PR')).toBeInTheDocument();
    expect(screen.getByText(/Ready to review/i)).toBeInTheDocument();
  });

  it('shows recognized PR info when input is valid', () => {
    render(<ReviewForm />);
    const input = screen.getByPlaceholderText(/e.g. owner\/repo#123/);
    fireEvent.change(input, { target: { value: 'valid-url' } });
    expect(screen.getByText(/Recognized:/)).toBeInTheDocument();
  });

  it('submits form when button is clicked', () => {
    const submitReview = vi.fn();
    (useReviewSubmission as any).mockReturnValue({
      status: 'idle',
      error: null,
      comments: [],
      submitReview,
      isWorking: false,
    });

    render(<ReviewForm />);
    const input = screen.getByPlaceholderText(/e.g. owner\/repo#123/);
    fireEvent.change(input, { target: { value: 'valid-url' } });
    
    const submitBtn = screen.getByText('Review PR');
    fireEvent.click(submitBtn);

    expect(submitReview).toHaveBeenCalledWith('valid-url');
  });

  it('shows skeletons when working', () => {
    (useReviewSubmission as any).mockReturnValue({
      status: 'fetching',
      error: null,
      comments: [],
      submitReview: vi.fn(),
      isWorking: true,
    });

    const { container } = render(<ReviewForm />);
    expect(screen.getByText('Fetching PR...')).toBeInTheDocument();
    const skeletons = container.querySelectorAll('[class*="container"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders grouped comments when they exist', () => {
    const groupedComments = {
      'file1.ts': [mockAiReviewComments[0]],
    };
    (useReviewComments as any).mockReturnValue({
      showOnlyCritical: false,
      groupedComments,
      hasComments: true,
    });

    render(<ReviewForm />);
    expect(screen.getByText('file1.ts')).toBeInTheDocument();
    expect(screen.getByText(mockAiReviewComments[0].content)).toBeInTheDocument();
  });

  it('shows error message from submission', () => {
    (useReviewSubmission as any).mockReturnValue({
      status: 'idle',
      error: { message: 'Something went wrong', isRetriable: true },
      comments: [],
      submitReview: vi.fn(),
      isWorking: false,
    });

    render(<ReviewForm />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('loads example PR when button clicked', () => {
    const submitReview = vi.fn();
    (useReviewSubmission as any).mockReturnValue({
      status: 'idle',
      submitReview,
      isWorking: false,
    });

    render(<ReviewForm />);
    const exampleBtn = screen.getByText('Example PR');
    fireEvent.click(exampleBtn);

    expect(submitReview).toHaveBeenCalledWith('vercel/next.js/pull/76505');
  });
});
