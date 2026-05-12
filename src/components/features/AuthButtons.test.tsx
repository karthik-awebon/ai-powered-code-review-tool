import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthButtons } from './AuthButtons';
import * as authExports from '../../auth';

vi.mock('../../auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe('AuthButtons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in button when not authenticated', async () => {
    (authExports.auth as any).mockResolvedValue(null);

    const Result = await AuthButtons();
    render(Result);

    expect(screen.getByRole('button', { name: /sign in with github/i })).toBeInTheDocument();
  });

  it('renders user avatar and sign out button when authenticated', async () => {
    (authExports.auth as any).mockResolvedValue({
      user: {
        name: 'Test User',
        image: 'https://example.com/avatar.png',
      },
    });

    const Result = await AuthButtons();
    render(Result);

    expect(screen.getByAltText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
