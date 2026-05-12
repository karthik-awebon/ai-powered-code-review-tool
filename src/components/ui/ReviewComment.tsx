'use client';

import { useState } from 'react';
import { AiReviewComment } from '../../types';
import styles from './ReviewComment.module.css';

interface ReviewCommentProps {
  comment: AiReviewComment;
}

export function ReviewComment({ comment }: ReviewCommentProps) {
  // Low confidence is collapsed by default
  const [isCollapsed, setIsCollapsed] = useState(comment.confidence < 0.5);

  let confidenceClass = styles.highConfidence;
  if (comment.confidence < 0.5) confidenceClass = styles.lowConfidence;
  else if (comment.confidence < 0.8) confidenceClass = styles.mediumConfidence;

  let badgeClass = styles.badgeSuggestion;
  if (comment.severity === 'critical') badgeClass = styles.badgeCritical;
  else if (comment.severity === 'warning') badgeClass = styles.badgeWarning;

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);

  const confidencePercentage = Math.round(comment.confidence * 100);

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
          <span>{isCollapsed ? '▼' : '▲'}</span>
        </div>
      </div>
      <div className={styles.content}>
        {comment.content}
      </div>
    </div>
  );
}
