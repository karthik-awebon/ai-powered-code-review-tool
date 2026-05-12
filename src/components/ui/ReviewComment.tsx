'use client';

import { useState } from 'react';
import { AiReviewComment } from '../../types';
import styles from './ReviewComment.module.css';

import { APP_CONFIG } from '../../constants';

interface ReviewCommentProps {
  comment: AiReviewComment;
}

export function ReviewComment({ comment }: ReviewCommentProps) {
  const { LOW, MEDIUM } = APP_CONFIG.REVIEW.CONFIDENCE_THRESHOLDS;
  
  // Low confidence is collapsed by default
  const [isCollapsed, setIsCollapsed] = useState(comment.confidence < LOW);

  let confidenceClass = styles.highConfidence;
  if (comment.confidence < LOW) confidenceClass = styles.lowConfidence;
  else if (comment.confidence < MEDIUM) confidenceClass = styles.mediumConfidence;

  let badgeClass = styles.badgeSuggestion;
  if (comment.severity === 'critical') badgeClass = styles.badgeCritical;
  else if (comment.severity === 'warning') badgeClass = styles.badgeWarning;

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const confidencePercentage = Math.round(comment.confidence * 100);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const markdown = `**AI Review (Severity: ${comment.severity}, Confidence: ${confidencePercentage}%)**\n${comment.content}`;
    try {
      await navigator.clipboard.writeText(markdown);
      // Optional: Add a temporary toast or success state here
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className={`${styles.container} ${confidenceClass} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.header} onClick={toggleCollapse}>
        <div className={styles.title}>
          AI Review (Line {comment.lineNumber})
        </div>
        <div className={styles.meta}>
          <span className={`${styles.badge} ${badgeClass}`}>
            {comment.severity}
          </span>
          <span className={styles.badge} title="AI Confidence Score">
            {confidencePercentage}% confident
          </span>
          <button className={styles.copyButton} onClick={handleCopy} aria-label="Copy for GitHub">
            Copy
          </button>
          <span>{isCollapsed ? '▼' : '▲'}</span>
        </div>
      </div>
      <div className={styles.content}>
        {comment.content}
        {comment.diffSnippet && (
          <div className={styles.snippetContainer}>
            <pre className={styles.snippetPre}>
              <code>{comment.diffSnippet}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
