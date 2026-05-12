import { logger } from '../utils/logger';

export function parseGitHubPRUrl(url: string): { owner: string; repo: string; pullNumber: number } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') {
      logger.debug({ hostname: parsed.hostname }, 'Non-GitHub hostname provided');
      return null;
    }

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 4 && parts[2] === 'pull') {
      const details = {
        owner: parts[0],
        repo: parts[1],
        pullNumber: parseInt(parts[3], 10),
      };
      logger.debug(details, 'Successfully parsed GitHub PR URL');
      return details;
    }
    logger.debug({ path: parsed.pathname }, 'URL path does not match GitHub PR pattern');
    return null;
  } catch (error: any) {
    logger.debug({ url, error: error.message }, 'Failed to parse URL');
    return null;
  }
}

export async function fetchPRDiff(owner: string, repo: string, pullNumber: number): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;
  
  logger.debug({ owner, repo, pullNumber }, 'Fetching diff from GitHub API');
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3.diff',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    // We revalidate occasionally or cache based on use case.
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    logger.error({ status: response.status, statusText: response.statusText, owner, repo, pullNumber }, 'GitHub API error when fetching diff');
    throw new Error(`Failed to fetch PR diff: ${response.statusText}`);
  }

  const diff = await response.text();
  logger.debug({ diffLength: diff.length }, 'Successfully retrieved PR diff');
  return diff;
}
