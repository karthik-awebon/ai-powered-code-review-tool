import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';

vi.mock('../auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

describe('Home Page', () => {
  it('renders the title', async () => {
    const Component = await Home();
    render(Component);
    const title = screen.getByText(/AI-Powered Code Review Tool/i);
    expect(title).toBeInTheDocument();
  });
});
