'use client';

import { useState, FormEvent, useMemo } from 'react';
import { ReviewComment } from '../ui/ReviewComment';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonComment } from '../ui/SkeletonComment';
import { ErrorMessage } from '../ui/ErrorMessage';
import { parsePRInput } from '../../services/github';
import { useDefaultRepo } from '../../hooks/useDefaultRepo';
import { useRecentReviews } from '../../hooks/useRecentReviews';
import { useReviewSubmission } from '../../hooks/useReviewSubmission';
import { useReviewComments, SortOrder } from '../../hooks/useReviewComments';
import styles from './ReviewForm.module.css';

/**
 * ReviewForm component that serves as the main entry point for the review process.
 * 
 * It manages the input for the GitHub Pull Request URL, handles the submission
 * workflow, and coordinates the display of results, loading states, and error messages.
 * It also provides filtering and sorting capabilities for the generated review comments.
 * 
 * @returns The complete review interface including input form and result display.
 */
export function ReviewForm() {
  const [url, setUrl] = useState('');

  const { defaultRepo, saveDefaultRepo, isLoaded: isRepoLoaded } = useDefaultRepo();
  const { recentReviews, addRecentReview, isLoaded: isReviewsLoaded } = useRecentReviews();

  const {
    status,
    error,
    comments,
    submitReview,
    retry,
    clearError,
    isWorking
  } = useReviewSubmission({
    defaultRepo,
    onSuccess: addRecentReview
  });

  const {
    showOnlyCritical,
    setShowOnlyCritical,
    sortByConfidence,
    setSortByConfidence,
    groupedComments,
    hasComments
  } = useReviewComments(comments);

  // Inline Validation State
  const parsedInput = useMemo(() => parsePRInput(url, defaultRepo), [url, defaultRepo]);

  const handleSubmit = (e?: FormEvent, targetInput?: string) => {
    e?.preventDefault();
    submitReview(targetInput || url);
  };

  const handleExamplePR = () => {
    const example = 'vercel/next.js/pull/76505';
    setUrl(example);
    submitReview(example);
  };

  let buttonText = 'Review PR';
  if (status === 'fetching') buttonText = 'Fetching PR...';
  if (status === 'generating') buttonText = 'Analyzing...';

  // Avoid hydration mismatch by waiting for localStorage to load
  if (!isRepoLoaded || !isReviewsLoaded) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label className={styles.headerLabel}>Pull Request to Review</label>
        <div className={styles.defaultRepo}>
          <span>Default Repo:</span>
          <input 
            type="text" 
            placeholder="owner/repo" 
            value={defaultRepo}
            onChange={(e) => saveDefaultRepo(e.target.value)}
            className={styles.defaultRepoInput}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. owner/repo#123 or https://github.com/..."
            required
            className={styles.prInput}
          />
          {url && parsedInput && (
            <span className={styles.validationSuccess}>
              ✓ Recognized: {parsedInput.owner}/{parsedInput.repo} #{parsedInput.pullNumber}
            </span>
          )}
          {url && !parsedInput && (
            <span className={styles.validationError}>
              ✗ Unrecognized format
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleExamplePR}
          disabled={isWorking}
          className={styles.exampleButton}
        >
          Example PR
        </button>

        <button
          type="submit"
          disabled={isWorking || (!!url && !parsedInput)}
          className={styles.submitButton}
        >
          {buttonText}
        </button>
      </form>

      {recentReviews.length > 0 && (
        <div className={styles.recentContainer}>
          <span className={styles.recentLabel}>Recent:</span>
          <div className={styles.recentList}>
            {recentReviews.map(review => (
              <button
                key={review.id}
                type="button"
                onClick={() => { setUrl(review.inputString); submitReview(review.inputString); }}
                disabled={isWorking}
                className={styles.recentPill}
              >
                {review.owner}/{review.repo}#{review.pullNumber}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacing if no recent reviews */}
      {recentReviews.length === 0 && <div className={styles.spacer}></div>}

      {error && (
        <ErrorMessage 
          message={error.message} 
          actionableHint={error.actionableHint}
          onRetry={retry} 
          onClear={clearError} 
        />
      )}

      {hasComments && (
        <div className={styles.filtersContainer}>
          <label className={styles.checkboxLabel}>
            <input 
              type="checkbox" 
              checked={showOnlyCritical} 
              onChange={(e) => setShowOnlyCritical(e.target.checked)} 
            />
            Show Critical Only
          </label>
          <div className={styles.sortContainer}>
            <label htmlFor="sortConf">Sort by Confidence:</label>
            <select 
              id="sortConf"
              value={sortByConfidence} 
              onChange={(e) => setSortByConfidence(e.target.value as SortOrder)}
              className={styles.sortSelect}
            >
              <option value="none">None</option>
              <option value="desc">High to Low</option>
              <option value="asc">Low to High</option>
            </select>
          </div>
        </div>
      )}

      <div>
        {status === 'idle' && !hasComments && !error && <EmptyState />}
        
        {isWorking && !hasComments && (
          <>
            <SkeletonComment />
            <SkeletonComment />
            <SkeletonComment />
          </>
        )}

        {Object.entries(groupedComments).map(([filePath, fileComments]) => (
          <div key={filePath} className={styles.fileGroup}>
            <h3 className={styles.fileHeader}>
              {filePath}
            </h3>
            {fileComments.map((comment) => (
              <ReviewComment key={comment.id} comment={comment} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
