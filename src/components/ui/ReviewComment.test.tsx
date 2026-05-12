import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReviewComment } from './ReviewComment';
import { AiReviewComment } from '../../types';

describe('ReviewComment Component', () => {
  const mockCommentBase: Omit<AiReviewComment, 'confidence' | 'severity' | 'id'> = {
    filePath: 'test.ts',
    lineNumber: 42,
    content: 'This is a test comment.',
  };

  it('renders high confidence comment as expanded', () => {
    const comment: AiReviewComment = {
      ...mockCommentBase,
      id: '1',
      confidence: 0.9,
      severity: 'suggestion',
    };

    render(<ReviewComment comment={comment} />);
    
    // High confidence should be expanded by default, so content is visible
    const content = screen.getByText('This is a test comment.');
    expect(content).toBeInTheDocument();
    
    // Check for the confidence percentage text
    expect(screen.getByText('90% confident')).toBeInTheDocument();
  });

  it('renders low confidence comment as collapsed by default', () => {
    const comment: AiReviewComment = {
      ...mockCommentBase,
      id: '2',
      confidence: 0.4,
      severity: 'warning',
    };

    const { container } = render(<ReviewComment comment={comment} />);
    
    // Check if the collapsed class is present (since we manage visibility via CSS)
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('collapsed');

    // Click header to expand
    const header = screen.getByText(/AI Review/);
    fireEvent.click(header);

    // After click, it should not be collapsed
    expect(wrapper.className).not.toContain('collapsed');
  });

  it('renders correct severity badge', () => {
    const comment: AiReviewComment = {
      ...mockCommentBase,
      id: '3',
      confidence: 0.85,
      severity: 'critical',
    };

    render(<ReviewComment comment={comment} />);
    
    expect(screen.getByText('critical')).toBeInTheDocument();
  });

  it('renders diff snippet if available', () => {
    const comment: AiReviewComment = {
      ...mockCommentBase,
      id: '4',
      confidence: 0.9,
      severity: 'suggestion',
      diffSnippet: '+ const a = 1;',
    };

    render(<ReviewComment comment={comment} />);
    
    expect(screen.getByText('+ const a = 1;')).toBeInTheDocument();
  });

  it('copies comment to clipboard when copy button is clicked', async () => {
    const comment: AiReviewComment = {
      ...mockCommentBase,
      id: '5',
      confidence: 0.9,
      severity: 'suggestion',
    };

    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    render(<ReviewComment comment={comment} />);
    
    const copyButton = screen.getByLabelText('Copy for GitHub');
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      '**AI Review (Severity: suggestion, Confidence: 90%)**\nThis is a test comment.'
    );
  });
});
