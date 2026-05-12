import { useState } from 'react';
import { AiReviewComment } from '../types';
import { APP_CONFIG } from '../constants';

/**
 * Hook to manage the state and actions for an individual AI review comment.
 * Handles collapsing logic based on confidence and provides clipboard functionality.
 * 
 * @param comment - The AI review comment object to manage.
 * @returns An object containing:
 * - `isCollapsed`: Boolean indicating if the comment is currently collapsed.
 * - `toggleCollapse`: Function to toggle the collapsed state.
 * - `confidencePercentage`: The confidence score as a whole number percentage.
 * - `copyToClipboard`: Function to copy the comment in markdown format to the clipboard.
 */
export function useReviewComment(comment: AiReviewComment) {
  const { LOW } = APP_CONFIG.REVIEW.CONFIDENCE_THRESHOLDS;
  
  // Low confidence is collapsed by default
  const [isCollapsed, setIsCollapsed] = useState(comment.confidence < LOW);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const confidencePercentage = Math.round(comment.confidence * 100);

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const markdown = `**AI Review (Severity: ${comment.severity}, Confidence: ${confidencePercentage}%)**\n${comment.content}`;
    try {
      await navigator.clipboard.writeText(markdown);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
      return false;
    }
  };

  return {
    isCollapsed,
    toggleCollapse,
    confidencePercentage,
    copyToClipboard
  };
}
