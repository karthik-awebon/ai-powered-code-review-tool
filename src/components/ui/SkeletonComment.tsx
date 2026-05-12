import styles from './SkeletonComment.module.css';

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
