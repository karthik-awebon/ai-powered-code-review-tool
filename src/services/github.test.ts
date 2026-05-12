import { describe, it, expect, vi } from 'vitest';
import { parsePRInput } from './github';

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
