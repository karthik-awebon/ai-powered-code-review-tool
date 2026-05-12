export function parseGitHubPRUrl(url: string): { owner: string; repo: string; pullNumber: number } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;

    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 4 && parts[2] === 'pull') {
      return {
        owner: parts[0],
        repo: parts[1],
        pullNumber: parseInt(parts[3], 10),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchPRDiff(owner: string, repo: string, pullNumber: number): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;
  
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3.diff',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    // We revalidate occasionally or cache based on use case.
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch PR diff: ${response.statusText}`);
  }

  return response.text();
}
