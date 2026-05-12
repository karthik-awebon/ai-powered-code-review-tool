'use client';

import styles from './ErrorMessage.module.css';

/**
 * Props for the ErrorMessage component.
 */
interface ErrorMessageProps {
  /** The error message to display to the user. */
  message: string;
  /** Optional hint providing actionable advice to the user. */
  actionableHint?: string;
  /** Optional callback to trigger a retry of the failed operation. */
  onRetry?: () => void;
  /** Callback to clear the error state and dismiss the message. */
  onClear: () => void;
}

/**
 * ErrorMessage component for displaying feedback when an operation fails.
 * 
 * It provides a structured alert with the error details and actions to either
 * retry the operation or dismiss the error.
 * 
 * @param props - The component props.
 * @returns An alert box with error details and action buttons.
 */
export function ErrorMessage({ message, actionableHint, onRetry, onClear }: ErrorMessageProps) {
  return (
    <div className={styles.container} role="alert">
      <div className={styles.header}>
        <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor">
          <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z"></path>
        </svg>
        <span>Review Failed</span>
      </div>
      <div className={styles.message}>
        {message}
      </div>
      {actionableHint && (
        <div className={styles.hint}>
          {actionableHint}
        </div>
      )}
      <div className={styles.actions}>
        {onRetry && (
          <button className={`${styles.button} ${styles.retryButton}`} onClick={onRetry}>
            Try Again
          </button>
        )}
        <button className={`${styles.button} ${styles.clearButton}`} onClick={onClear}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
