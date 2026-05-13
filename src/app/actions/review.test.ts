import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitPRReview, publishReviewAction } from './review';
import * as github from '../../services/github';
import * as llm from '../../services/llm';

vi.mock('../../auth', () => ({
  auth: vi.fn(),
}));

vi.mock('../../services/github', () => ({
  parsePRInput: vi.fn(),
  fetchPRDiff: vi.fn(),
  publishPRReview: vi.fn(),
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

  it('successfully returns LLM review stream with auth token', async () => {
    const prDetails = { owner: 'owner', repo: 'repo', pullNumber: 123 };
    const mockDiff = 'diff content';
    const mockStream = (async function* () {})();
    const { auth } = await import('../../auth');

    (github.parsePRInput as any).mockReturnValue(prDetails);
    (github.fetchPRDiff as any).mockResolvedValue(mockDiff);
    (llm.getLLMReviewStream as any).mockReturnValue(mockStream);
    (auth as any).mockResolvedValue({ accessToken: 'test-token' });

    const result = await submitPRReview('valid');
    expect(result).toBe(mockStream);
    expect(github.fetchPRDiff).toHaveBeenCalledWith('owner', 'repo', 123, 'test-token');
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

describe('publishReviewAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockComments = [
    {
      id: '1',
      filePath: 'src/index.ts',
      lineNumber: 10,
      content: 'Test comment',
      confidence: 0.9,
      severity: 'suggestion' as const
    }
  ];

  it('returns error if user is not authenticated', async () => {
    const { auth } = await import('../../auth');
    (auth as any).mockResolvedValue(null);

    const result = await publishReviewAction('owner/repo#123', mockComments);
    expect(result).toEqual({ error: 'You must be signed in to publish reviews to GitHub.' });
  });

  it('returns error if PR input is invalid', async () => {
    const { auth } = await import('../../auth');
    (auth as any).mockResolvedValue({ accessToken: 'test-token' });
    (github.parsePRInput as any).mockReturnValue(null);

    const result = await publishReviewAction('invalid', mockComments);
    expect(result).toEqual({ error: 'Invalid GitHub PR input format' });
  });

  it('successfully publishes review and returns success', async () => {
    const { auth } = await import('../../auth');
    (auth as any).mockResolvedValue({ accessToken: 'test-token' });
    const prDetails = { owner: 'owner', repo: 'repo', pullNumber: 123 };
    (github.parsePRInput as any).mockReturnValue(prDetails);
    (github.publishPRReview as any).mockResolvedValue(undefined);

    const result = await publishReviewAction('owner/repo#123', mockComments);
    expect(result).toEqual({ success: true });
    expect(github.publishPRReview).toHaveBeenCalledWith('owner', 'repo', 123, 'test-token', mockComments);
  });

  it('returns error if publishing fails', async () => {
    const { auth } = await import('../../auth');
    (auth as any).mockResolvedValue({ accessToken: 'test-token' });
    const prDetails = { owner: 'owner', repo: 'repo', pullNumber: 123 };
    (github.parsePRInput as any).mockReturnValue(prDetails);
    (github.publishPRReview as any).mockRejectedValue(new Error('API Error'));

    const result = await publishReviewAction('owner/repo#123', mockComments);
    expect(result).toEqual({ error: 'API Error' });
  });
});
