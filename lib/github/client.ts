export interface GitHubRepository {
  owner: string;
  repo: string;
  repositoryUrl: string;
  defaultBranch: string;
  commitSha: string;
  commitTimestamp: string;
  commitUrl: string;
}

export function parseGitHubRepositoryUrl(input: string): {
  owner: string;
  repo: string;
} {
  const url = new URL(input);
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
    throw new Error("Repository must be an HTTPS github.com URL");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("Repository URL contains unsupported credentials or parameters");
  }
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) {
    throw new Error("Use a repository URL in the form https://github.com/owner/repo");
  }
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("Repository owner or name is invalid");
  }
  return { owner, repo };
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ShipReceipt/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function githubJson(url: string): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    headers: githubHeaders(),
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  });
  if (response.status === 404) {
    throw new Error("Repository is unavailable, private, or does not exist");
  }
  if (response.status === 403 && response.headers.get("x-ratelimit-remaining") === "0") {
    throw new Error("GitHub API rate limit reached; configure a server-side GITHUB_TOKEN");
  }
  if (!response.ok) throw new Error(`GitHub API returned HTTP ${response.status}`);
  return (await response.json()) as Record<string, unknown>;
}

export async function resolveGitHubRepository(input: string): Promise<GitHubRepository> {
  const { owner, repo } = parseGitHubRepositoryUrl(input);
  const repository = await githubJson(`https://api.github.com/repos/${owner}/${repo}`);
  const defaultBranch = repository.default_branch;
  const size = repository.size;
  if (typeof defaultBranch !== "string" || !defaultBranch) {
    throw new Error("Repository default branch could not be resolved");
  }
  if (typeof size !== "number" || size <= 0) throw new Error("Repository is empty");

  const commit = await githubJson(
    `https://api.github.com/repos/${owner}/${repo}/commits/${encodeURIComponent(defaultBranch)}`,
  );
  const sha = commit.sha;
  const nestedCommit = commit.commit as Record<string, unknown> | undefined;
  const committer = nestedCommit?.committer as Record<string, unknown> | undefined;
  const date = committer?.date;
  if (typeof sha !== "string" || !/^[a-f0-9]{40}$/.test(sha)) {
    throw new Error("GitHub returned an invalid commit SHA");
  }
  if (typeof date !== "string" || Number.isNaN(Date.parse(date))) {
    throw new Error("GitHub returned an invalid commit timestamp");
  }

  return {
    owner,
    repo,
    repositoryUrl: `https://github.com/${owner}/${repo}`,
    defaultBranch,
    commitSha: sha,
    commitTimestamp: new Date(date).toISOString(),
    commitUrl: `https://github.com/${owner}/${repo}/commit/${sha}`,
  };
}

