import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parsePRInput, fetchPRDiff } from './github';

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
      expect.any(Object)
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
