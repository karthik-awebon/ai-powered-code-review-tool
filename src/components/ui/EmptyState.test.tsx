import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState Component', () => {
  it('renders default title and subtitle correctly', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('Ready to review your code')).toBeInTheDocument();
    expect(screen.getByText(/Enter a GitHub Pull Request URL/)).toBeInTheDocument();
  });

  it('applies the correct CSS class', () => {
    const { container } = render(<EmptyState />);
    const div = container.firstChild as HTMLElement;
    // CSS modules hash class names, so we check if it has A class name that looks like container
    expect(div.className).toMatch(/container/);
  });
});
