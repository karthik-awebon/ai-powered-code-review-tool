import { logger } from '../utils/logger';
import { APP_CONFIG, ERROR_MESSAGES } from '../constants';
import { GitHubPRDetails } from '../types';

/**
 * Parses a pull request input string which can be a full URL, owner/repo#number,
 * or just a number (if a default repository is provided).
 * 
 * @param input - The PR reference string (URL, owner/repo#123, or just 123).
 * @param defaultRepo - Optional default owner/repo to use if only a number is provided.
 * @returns An object containing owner, repo, and pullNumber, or null if parsing fails.
 */
export function parsePRInput(input: string, defaultRepo?: string): GitHubPRDetails | null {
  try {
    input = input.trim();
    if (!input) return null;

    // Handle full URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const parsed = new URL(input);
      if (parsed.hostname !== 'github.com') return null;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length >= 4 && parts[2] === 'pull') {
        return { owner: parts[0], repo: parts[1], pullNumber: parseInt(parts[3], 10) };
      }
      return null;
    }

    // Handle owner/repo#123 or owner/repo/pull/123
    let match = input.match(/^([^/]+)\/([^/#]+)(?:#|\/pull\/)(\d+)$/);
    if (match) {
      return { owner: match[1], repo: match[2], pullNumber: parseInt(match[3], 10) };
    }

    // Handle just the PR number if defaultRepo is provided
    match = input.match(/^(?:#)?(\d+)$/);
    if (match && defaultRepo) {
      const repoParts = defaultRepo.split('/');
      if (repoParts.length === 2) {
        return { owner: repoParts[0], repo: repoParts[1], pullNumber: parseInt(match[1], 10) };
      }
    }

    return null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.debug({ input, error: errorMessage }, 'Failed to parse PR input');
    return null;
  }
}

/**
 * Fetches the diff of a pull request from GitHub.
 * 
 * @param owner - The owner of the repository.
 * @param repo - The name of the repository.
 * @param pullNumber - The pull request number.
 * @returns A promise that resolves to the diff string.
 * @throws Error if the fetch fails or the response is not OK.
 */
export async function fetchPRDiff(owner: string, repo: string, pullNumber: number): Promise<string> {
  const url = `${APP_CONFIG.GITHUB.BASE_URL}/repos/${owner}/${repo}/pulls/${pullNumber}`;
  
  logger.debug({ owner, repo, pullNumber }, 'Fetching diff from GitHub API');
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3.diff',
      'X-GitHub-Api-Version': APP_CONFIG.GITHUB.API_VERSION
    },
    next: { revalidate: APP_CONFIG.GITHUB.REVALIDATE_SECONDS }
  });

  if (!response.ok) {
    logger.error({ status: response.status, statusText: response.statusText, owner, repo, pullNumber }, 'GitHub API error when fetching diff');
    throw new Error(ERROR_MESSAGES.FETCH_FAILED);
  }

  const diff = await response.text();
  logger.debug({ diffLength: diff.length }, 'Successfully retrieved PR diff');
  return diff;
}
