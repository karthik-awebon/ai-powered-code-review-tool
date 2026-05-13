import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLLMReviewStream } from './llm';
import { streamObject } from 'ai';
import { mockAiReviewComments } from '../__mocks__/reviewMocks';

vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(),
}));

vi.mock('ai', () => ({
  streamObject: vi.fn(),
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../utils/diff', () => ({
  extractSnippetFromDiff: vi.fn((_diff, filePath, lineNumber) => `snippet-${filePath}-${lineNumber}`),
}));

describe('getLLMReviewStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('yields comments from the stream correctly using elementStream', async () => {
    const mockElementStream = (async function* () {
      for (const comment of mockAiReviewComments) {
        yield comment;
      }
    })();

    (streamObject as any).mockReturnValue({
      elementStream: mockElementStream,
    });

    const diff = 'some diff';
    const generator = getLLMReviewStream(diff);
    const results = [];

    for await (const result of generator) {
      results.push(result);
    }

    expect(results).toHaveLength(mockAiReviewComments.length);
    expect(results[0].diffSnippet).toBe(`snippet-${mockAiReviewComments[0].filePath}-${mockAiReviewComments[0].lineNumber}`);
  });

  it('throws when an error occurs in elementStream', async () => {
    const mockElementStream = (async function* () {
      yield mockAiReviewComments[0];
      throw { status: 429, message: 'Rate limit exceeded' };
    })();

    (streamObject as any).mockReturnValue({
      elementStream: mockElementStream,
    });

    const diff = 'some diff';
    const generator = getLLMReviewStream(diff);

    await expect(async () => {
      for await (const _ of generator) {}
    }).rejects.toThrow('The AI service is currently experiencing high demand. Please try again in a moment.');
  });

  it('throws ERROR_MESSAGES.LLM_BUSY when 503 error occurs during initialization', async () => {
    (streamObject as any).mockImplementation(() => {
      throw { statusCode: 503, message: 'Service Unavailable' };
    });

    const diff = 'some diff';
    const generator = getLLMReviewStream(diff);

    await expect(async () => {
      for await (const _ of generator) {}
    }).rejects.toThrow('The AI service is currently experiencing high demand. Please try again in a moment.');
  });

  it('throws ERROR_MESSAGES.LLM_BUSY when 429 error occurs during initialization', async () => {
    (streamObject as any).mockImplementation(() => {
      throw { status: 429, message: 'Too Many Requests' };
    });

    const diff = 'some diff';
    const generator = getLLMReviewStream(diff);

    await expect(async () => {
      for await (const _ of generator) {}
    }).rejects.toThrow('The AI service is currently experiencing high demand. Please try again in a moment.');
  });

  it('throws ERROR_MESSAGES.LLM_FAILED for other errors', async () => {
    (streamObject as any).mockImplementation(() => {
      throw new Error('Generic error');
    });

    const diff = 'some diff';
    const generator = getLLMReviewStream(diff);

    await expect(async () => {
      for await (const _ of generator) {}
    }).rejects.toThrow('An error occurred while analyzing the code. Please try again.');
  });
});
