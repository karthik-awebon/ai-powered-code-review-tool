import styles from './SkeletonComment.module.css';

/**
 * SkeletonComment component used as a loading placeholder.
 * 
 * It renders a pulsing skeleton screen that mimics the layout of the 
 * ReviewComment component, providing visual feedback during data fetching
 * or AI analysis.
 * 
 * @returns A pulsing placeholder UI.
 */
export function SkeletonComment() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={`${styles.pulse} ${styles.titleSkeleton}`}></div>
        <div className={styles.metaSkeleton}>
          <div className={`${styles.pulse} ${styles.badgeSkeleton}`}></div>
          <div className={`${styles.pulse} ${styles.badgeSkeleton}`}></div>
        </div>
      </div>
      <div className={styles.content}>
        <div className={`${styles.pulse} ${styles.lineSkeleton}`} style={{ width: '100%' }}></div>
        <div className={`${styles.pulse} ${styles.lineSkeleton}`} style={{ width: '90%' }}></div>
        <div className={`${styles.pulse} ${styles.lineSkeleton}`} style={{ width: '80%' }}></div>
      </div>
    </div>
  );
}
