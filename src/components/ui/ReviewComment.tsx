'use client';

import { AiReviewComment } from '../../types';
import styles from './ReviewComment.module.css';
import { APP_CONFIG } from '../../constants';
import { useReviewComment } from '../../hooks/useReviewComment';

/**
 * Props for the ReviewComment component.
 */
interface ReviewCommentProps {
  /** The AI-generated review comment object containing findings and metadata. */
  comment: AiReviewComment;
}

/**
 * ReviewComment component that displays an individual AI finding.
 * 
 * This component renders the comment content, severity level, confidence score,
 * and relevant code snippets. It supports collapsing/expanding and copying the
 * comment to the clipboard for use on GitHub.
 * 
 * @param props - The component props.
 * @returns A collapsible card containing the review feedback.
 */
export function ReviewComment({ comment }: ReviewCommentProps) {
  const { LOW, MEDIUM } = APP_CONFIG.REVIEW.CONFIDENCE_THRESHOLDS;
  const { isCollapsed, toggleCollapse, confidencePercentage, copyToClipboard } = useReviewComment(comment);

  let confidenceClass = styles.highConfidence;
  if (comment.confidence < LOW) confidenceClass = styles.lowConfidence;
  else if (comment.confidence < MEDIUM) confidenceClass = styles.mediumConfidence;

  let badgeClass = styles.badgeSuggestion;
  if (comment.severity === 'critical') badgeClass = styles.badgeCritical;
  else if (comment.severity === 'warning') badgeClass = styles.badgeWarning;

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
          <button className={styles.copyButton} onClick={copyToClipboard} aria-label="Copy for GitHub">
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
