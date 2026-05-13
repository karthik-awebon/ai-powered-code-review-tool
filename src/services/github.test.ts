import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parsePRInput, fetchPRDiff, publishPRReview } from './github';
import { AiReviewComment } from '../types';

vi.mock('../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }
}));

describe('parsePRInput', () => {
  it('parses full valid URLs correctly', () => {
    expect(parsePRInput('https://github.com/owner/repo/pull/123')).toEqual({ owner: 'owner', repo: 'repo', pullNumber: 123 });
    expect(parsePRInput('http://github.com/owner/repo/pull/123')).toEqual({ owner: 'owner', repo: 'repo', pullNumber: 123 });
  });

  it('parses shorthand formats correctly', () => {
    expect(parsePRInput('owner/repo#123')).toEqual({ owner: 'owner', repo: 'repo', pullNumber: 123 });
    expect(parsePRInput('owner/repo/pull/123')).toEqual({ owner: 'owner', repo: 'repo', pullNumber: 123 });
  });

  it('parses PR number-only formats when defaultRepo is provided', () => {
    expect(parsePRInput('123', 'owner/repo')).toEqual({ owner: 'owner', repo: 'repo', pullNumber: 123 });
    expect(parsePRInput('#123', 'owner/repo')).toEqual({ owner: 'owner', repo: 'repo', pullNumber: 123 });
  });

  it('returns null for PR number-only formats when no defaultRepo is provided', () => {
    expect(parsePRInput('123')).toBeNull();
    expect(parsePRInput('#123')).toBeNull();
  });

  it('returns null for invalid inputs', () => {
    expect(parsePRInput('https://not-github.com/owner/repo/pull/123')).toBeNull();
    expect(parsePRInput('owner/repo')).toBeNull();
    expect(parsePRInput('random string')).toBeNull();
    expect(parsePRInput('')).toBeNull();
    expect(parsePRInput('   ')).toBeNull();
  });

  it('trims whitespace', () => {
    expect(parsePRInput('  owner/repo#123  ')).toEqual({ owner: 'owner', repo: 'repo', pullNumber: 123 });
    expect(parsePRInput('  #123  ', 'owner/repo')).toEqual({ owner: 'owner', repo: 'repo', pullNumber: 123 });
  });
});

describe('fetchPRDiff', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('successfully fetches diff', async () => {
    const mockDiff = 'diff content';
    (fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockDiff),
    });

    const result = await fetchPRDiff('owner', 'repo', 123);
    expect(result).toBe(mockDiff);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/repos/owner/repo/pulls/123'),
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: expect.any(String)
        })
      })
    );
  });

  it('includes Authorization header when accessToken is provided', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('diff content'),
    });

    await fetchPRDiff('owner', 'repo', 123, 'test-token');
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    );
  });

  it('throws error when fetch fails', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(fetchPRDiff('owner', 'repo', 123)).rejects.toThrow('Failed to retrieve the pull request details. Please check the URL and your connection.');
  });
});

describe('publishPRReview', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  const mockComments: AiReviewComment[] = [
    {
      id: '1',
      filePath: 'src/index.ts',
      lineNumber: 10,
      content: 'Consider renaming this variable',
      confidence: 0.9,
      severity: 'suggestion'
    }
  ];

  it('successfully publishes a review', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('ok'),
    });

    await publishPRReview('owner', 'repo', 123, 'test-token', mockComments);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/repos/owner/repo/pulls/123/reviews'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          event: 'COMMENT',
          body: 'AI-Powered Code Review Feedback',
          comments: [
            {
              path: 'src/index.ts',
              line: 10,
              body: '**AI Review (SUGGESTION)**: Consider renaming this variable'
            }
          ]
        })
      })
    );
  });

  it('throws error when fetch fails', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve('Error details'),
    });

    await expect(publishPRReview('owner', 'repo', 123, 'test-token', mockComments))
      .rejects.toThrow('Failed to publish PR review to GitHub');
  });
});
