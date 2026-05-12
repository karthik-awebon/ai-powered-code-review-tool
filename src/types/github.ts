/**
 * Represents the details needed to identify a GitHub Pull Request.
 */
export interface GitHubPRDetails {
  /** The owner of the repository (username or organization). */
  owner: string;
  /** The name of the repository. */
  repo: string;
  /** The pull request number. */
  pullNumber: number;
}
