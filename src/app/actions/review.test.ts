import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitPRReview } from './review';
import * as github from '../../services/github';
import * as llm from '../../services/llm';

vi.mock('../../services/github', () => ({
  parsePRInput: vi.fn(),
  fetchPRDiff: vi.fn(),
}));

vi.mock('../../services/llm', () => ({
  getLLMReviewStream: vi.fn(),
}));

vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('submitPRReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns error if PR input is invalid', async () => {
    (github.parsePRInput as any).mockReturnValue(null);

    const result = await submitPRReview('invalid');
    expect(result).toEqual({ error: 'Invalid GitHub PR input format' });
  });

  it('successfully returns LLM review stream', async () => {
    const prDetails = { owner: 'owner', repo: 'repo', pullNumber: 123 };
    const mockDiff = 'diff content';
    const mockStream = (async function* () {})();

    (github.parsePRInput as any).mockReturnValue(prDetails);
    (github.fetchPRDiff as any).mockResolvedValue(mockDiff);
    (llm.getLLMReviewStream as any).mockReturnValue(mockStream);

    const result = await submitPRReview('valid');
    expect(result).toBe(mockStream);
    expect(github.fetchPRDiff).toHaveBeenCalledWith('owner', 'repo', 123);
    expect(llm.getLLMReviewStream).toHaveBeenCalledWith(mockDiff);
  });

  it('returns error if fetching diff fails', async () => {
    const prDetails = { owner: 'owner', repo: 'repo', pullNumber: 123 };
    (github.parsePRInput as any).mockReturnValue(prDetails);
    (github.fetchPRDiff as any).mockRejectedValue(new Error('Fetch failed'));

    const result = await submitPRReview('valid');
    expect(result).toEqual({ error: 'Fetch failed' });
  });
});
