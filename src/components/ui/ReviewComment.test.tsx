import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewComment } from './ReviewComment';
import { AiReviewComment } from '../../types';
import { mockAiReviewComment } from '../../__mocks__/reviewMocks';

describe('ReviewComment Component', () => {
  it('renders high confidence comment as expanded', () => {
    const comment: AiReviewComment = {
      ...mockAiReviewComment,
      confidence: 0.9,
    };

    render(<ReviewComment comment={comment} />);
    
    expect(screen.getByText(comment.content)).toBeInTheDocument();
    expect(screen.getByText('90% confident')).toBeInTheDocument();
  });

  it('renders low confidence comment as collapsed by default', () => {
    const comment: AiReviewComment = {
      ...mockAiReviewComment,
      confidence: 0.3,
    };

    const { container } = render(<ReviewComment comment={comment} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('collapsed');

    // Click header to expand
    const header = screen.getByText(/AI Review/);
    fireEvent.click(header);

    expect(wrapper.className).not.toContain('collapsed');
  });

  it('renders correct severity badge', () => {
    const comment: AiReviewComment = {
      ...mockAiReviewComment,
      severity: 'critical',
    };

    render(<ReviewComment comment={comment} />);
    
    expect(screen.getByText('critical')).toBeInTheDocument();
  });

  it('renders diff snippet if available', () => {
    const comment: AiReviewComment = {
      ...mockAiReviewComment,
      diffSnippet: '+ const a = 1;',
    };

    render(<ReviewComment comment={comment} />);
    
    expect(screen.getByText('+ const a = 1;')).toBeInTheDocument();
  });

  it('copies comment to clipboard when copy button is clicked', async () => {
    const comment = mockAiReviewComment;

    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    render(<ReviewComment comment={comment} />);
    
    const copyButton = screen.getByLabelText('Copy for GitHub');
    fireEvent.click(copyButton);

    const confidencePercentage = Math.round(comment.confidence * 100);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      `**AI Review (Severity: ${comment.severity}, Confidence: ${confidencePercentage}%)**\n${comment.content}`
    );
  });
});
