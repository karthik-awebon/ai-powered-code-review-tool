import { AiReviewComment, RecentReview } from '../types';

/**
 * A single mock AI-generated review comment.
 */
export const mockAiReviewComment: AiReviewComment = {
  id: '1',
  filePath: 'src/app/page.tsx',
  lineNumber: 10,
  content: 'Consider using a more descriptive variable name here.',
  confidence: 0.95,
  severity: 'suggestion',
  diffSnippet: '- const x = 1;\n+ const pageCount = 1;',
};

/**
 * An array of mock AI-generated review comments with various severities and confidence levels.
 */
export const mockAiReviewComments: AiReviewComment[] = [
  mockAiReviewComment,
  {
    id: '2',
    filePath: 'src/utils/diff.ts',
    lineNumber: 25,
    content: 'Potential null pointer dereference.',
    confidence: 0.8,
    severity: 'critical',
  },
  {
    id: '3',
    filePath: 'src/components/ReviewForm.tsx',
    lineNumber: 42,
    content: 'This component is getting a bit large. Consider refactoring.',
    confidence: 0.6,
    severity: 'warning',
  },
];

/**
 * Mock data representing a recently performed review.
 */
export const mockRecentReview: RecentReview = {
  id: 'owner/repo#123',
  owner: 'owner',
  repo: 'repo',
  pullNumber: 123,
  inputString: 'owner/repo#123',
  timestamp: Date.now(),
};

/**
 * An array of mock recent reviews for testing history or recent activity components.
 */
export const mockRecentReviews: RecentReview[] = [
  mockRecentReview,
  {
    id: 'another/project#456',
    owner: 'another',
    repo: 'project',
    pullNumber: 456,
    inputString: 'another/project#456',
    timestamp: Date.now() - 86400000,
  },
];
