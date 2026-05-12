import { ReviewForm } from '../components/features/ReviewForm';

/**
 * Home page of the AI-Powered Code Review Tool.
 * Provides a clean interface for users to enter a GitHub PR and start a review.
 */
export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
        AI-Powered Code Review Tool
      </h1>
      <p style={{ fontSize: '18px', color: '#57606a', marginBottom: '48px' }}>
        Enter a GitHub Pull Request URL to receive a contextual LLM review.
      </p>
      
      <ReviewForm />
    </main>
  );
}
