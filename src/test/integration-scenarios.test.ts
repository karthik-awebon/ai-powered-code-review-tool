import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitPRReview } from '../app/actions/review';
import { streamObject } from 'ai';
import { mockAiReviewComments } from '../__mocks__/reviewMocks';

// Mock the AI SDK at the lowest possible level within our control
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(),
}));

vi.mock('ai', () => ({
  streamObject: vi.fn(),
}));

vi.mock('../auth', () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// Mock logger to avoid noise
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('PR Review Integration Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should successfully complete the full flow from action to AI streaming', async () => {
    // 1. Mock GitHub Diff Response
    const mockDiff = 'diff --git a/file.ts b/file.ts\n+const x = 1;';
    (fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockDiff),
    });

    // 2. Mock AI Stream Response
    const mockElementStream = (async function* () {
      for (const comment of mockAiReviewComments) {
        yield comment;
      }
    })();

    (streamObject as any).mockReturnValue({
      elementStream: mockElementStream,
    });

    // 3. Execute the Action
    const result = await submitPRReview('https://github.com/owner/repo/pull/123');

    // 4. Verify results
    if ('error' in result) {
      throw new Error('Action returned an error: ' + result.error);
    }

    const comments = [];
    for await (const comment of result) {
      comments.push(comment);
    }

    expect(comments).toHaveLength(mockAiReviewComments.length);
    expect(comments[0].content).toBe(mockAiReviewComments[0].content);
    
    // Verify GitHub was called correctly
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/repos/owner/repo/pulls/123'),
      expect.any(Object)
    );
    
    // Verify AI was called with the diff
    expect(streamObject).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining(mockDiff),
      })
    );
  });

  it('should handle GitHub API failures gracefully', async () => {
    // 1. Mock GitHub Error
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    // 2. Execute the Action
    const result = await submitPRReview('https://github.com/owner/repo/pull/123');

    // 3. Verify error
    expect(result).toEqual({
      error: 'Failed to retrieve the pull request details. Please check the URL and your connection.'
    });
  });

  it('should handle AI service unavailability (503) correctly', async () => {
    // 1. Mock GitHub Diff Response
    (fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('mock diff'),
    });

    // 2. Mock AI 503 Error
    (streamObject as any).mockImplementation(() => {
      throw { statusCode: 503, message: 'Service Unavailable' };
    });

    // 3. Execute the Action
    const result = await submitPRReview('https://github.com/owner/repo/pull/123');

    // 4. Verify results
    if (!('error' in result)) {
      // It returns the stream even if it might fail later, but let's see how our action handles it.
      // Actually submitPRReview returns getLLMReviewStream(diff) directly.
      // So we need to consume the stream to see the error.
      const stream = result;
      await expect(async () => {
        for await (const _ of stream) {}
      }).rejects.toThrow('The AI service is currently experiencing high demand. Please try again in a moment.');
    }
  });

  it('should support shorthand input with default repo', async () => {
    // 1. Mock GitHub
    (fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('mock diff'),
    });
    
    (streamObject as any).mockReturnValue({
      elementStream: (async function* () {})(),
    });

    // 2. Execute with shorthand
    await submitPRReview('#123', 'default/repo');

    // 3. Verify correct URL construction
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/repos/default/repo/pulls/123'),
      expect.any(Object)
    );
  });
});
