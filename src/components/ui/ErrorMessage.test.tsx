import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage Component', () => {
  const mockOnClear = vi.fn();

  it('renders title and message correctly', () => {
    const message = 'Something went wrong while fetching data.';
    
    render(<ErrorMessage message={message} onClear={mockOnClear} />);
    
    expect(screen.getByText('Review Failed')).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('renders try again button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorMessage message="Message" onRetry={onRetry} onClear={mockOnClear} />);
    
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders dismiss button and calls onClear', () => {
    render(<ErrorMessage message="Message" onClear={mockOnClear} />);
    
    const clearButton = screen.getByText('Dismiss');
    expect(clearButton).toBeInTheDocument();
    
    fireEvent.click(clearButton);
    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('applies the correct CSS class', () => {
    const { container } = render(<ErrorMessage message="Message" onClear={mockOnClear} />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toMatch(/container/);
  });
});
