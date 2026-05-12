import styles from './EmptyState.module.css';

export function EmptyState() {
  return (
    <div className={styles.container}>
      <svg
        className={styles.icon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="48"
        height="48"
        fill="currentColor"
      >
        <path d="M10.75 16.5a.75.75 0 0 1 0-1.5h2.5a.75.75 0 0 1 0 1.5h-2.5Zm-4.25-4a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h9.5a.75.75 0 0 1 0 1.5h-9.5a.75.75 0 0 1-.75-.75Z"></path>
        <path d="M3.5 3.75C3.5 2.784 4.284 2 5.25 2h13.5c.966 0 1.75.784 1.75 1.75v16.5A1.75 1.75 0 0 1 18.75 22H5.25A1.75 1.75 0 0 1 3.5 20.25Zm1.75-.25a.25.25 0 0 0-.25.25v16.5c0 .138.112.25.25.25h13.5a.25.25 0 0 0 .25-.25V3.75a.25.25 0 0 0-.25-.25Z"></path>
      </svg>
      <div className={styles.title}>Ready to review your code</div>
      <div className={styles.subtitle}>
        Enter a GitHub Pull Request URL above to get actionable feedback on code quality, potential bugs, and architecture.
      </div>
    </div>
  );
}
