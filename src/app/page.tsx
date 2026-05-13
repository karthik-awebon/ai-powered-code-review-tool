import styles from './page.module.css';
import { ReviewForm } from '../components/features/ReviewForm';
import { auth } from '../auth';

/**
 * Home page of the AI-Powered Code Review Tool.
 * Provides a clean interface for users to enter a GitHub PR and start a review.
 */
export default async function Home() {
  const session = await auth();

  return (
    <main className={styles.page}>
      <div className={styles.main}>
        <div className={styles.intro}>
          <h1>
            AI-Powered Code Review Tool
          </h1>
          <p>
            Enter a GitHub Pull Request URL to receive a contextual LLM review.
          </p>
        </div>
        <ReviewForm isAuthenticated={!!session} />
      </div>
    </main>
  );
}
