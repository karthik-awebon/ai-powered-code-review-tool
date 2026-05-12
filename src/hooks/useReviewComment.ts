import { useState } from 'react';
import { AiReviewComment } from '../types';
import { APP_CONFIG } from '../constants';

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
