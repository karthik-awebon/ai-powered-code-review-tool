import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from './page';

describe('Home Page', () => {
  it('renders the title', () => {
    render(<Home />);
    const title = screen.getByText(/AI-Powered Code Review Tool/i);
    expect(title).toBeInTheDocument();
  });
});
