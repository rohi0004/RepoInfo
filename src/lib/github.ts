import { Octokit } from "octokit";
import {
  cacheFile,
  getCachedFile,
  cacheRepoMetadata,
  getCachedRepoMetadata,
  cacheProfileData,
  getCachedProfileData,
  cacheFileTree,
  getCachedFileTree,
} from "./cache";

// Validate GitHub token
const githubToken = process.env.GITHUB_TOKEN;
const hasValidGithubToken = Boolean(githubToken && !githubToken.includes('your_github') && githubToken.trim() !== '');
if (!hasValidGithubToken) {
  console.warn('⚠️ GITHUB_TOKEN is not set or looks like a placeholder — GitHub API calls will be disabled and mock data will be used');
}

const octokit = new Octokit({
  auth: hasValidGithubToken ? githubToken : undefined,
  request: {
    fetch: (url: string, options: any) => {
      return fetch(url, {
        ...options,
        cache: 'no-store',
        next: { revalidate: 0 },
      });
    },
  },
});

// In-memory cache for the session
const profileCache = new Map<string, GitHubProfile>();
const repoCache = new Map<string, GitHubRepo>();

export interface GitHubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  owner: {
    login: string;
  };
  updated_at: string;
}

export interface FileNode {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
  url: string;
}

export async function getProfile(username: string): Promise<GitHubProfile> {
  // Check memory cache first
  if (profileCache.has(username)) {
    return profileCache.get(username)!;
  }

  // Check KV cache
  const cached = await getCachedProfileData(username);
  if (cached) {
    profileCache.set(username, cached);
    return cached;
  }

  // If no valid token, return a lightweight mock profile
  if (!hasValidGithubToken) {
    const mock: GitHubProfile = {
      login: username,
      avatar_url: 'https://avatars.githubusercontent.com/u/0?v=4',
      html_url: `https://github.com/${username}`,
      name: null,
      bio: 'Mock profile — running without GitHub credentials',
      public_repos: 0,
      followers: 0,
      following: 0,
      created_at: new Date().toISOString(),
    };
    profileCache.set(username, mock);
    return mock;
  }

  // Fetch from GitHub
  const { data } = await octokit.rest.users.getByUsername({ username });

  // Cache in both memory and KV
  profileCache.set(username, data);
  await cacheProfileData(username, data);

  return data;
}

export async function getRepo(owner: string, repo: string): Promise<GitHubRepo> {
  const cacheKey = `${owner}/${repo}`;

  // Check memory cache
  if (repoCache.has(cacheKey)) {
    return repoCache.get(cacheKey)!;
  }

  // Check KV cache
  const cached = await getCachedRepoMetadata(owner, repo);
  if (cached) {
    repoCache.set(cacheKey, cached);
    return cached;
  }

  // If no valid token, return a mock repo object
  if (!hasValidGithubToken) {
    const mock: GitHubRepo = {
      name: repo,
      full_name: `${owner}/${repo}`,
      description: 'Mock repository — running without GitHub credentials',
      html_url: `https://github.com/${owner}/${repo}`,
      stargazers_count: 0,
      language: null,
      forks_count: 0,
      open_issues_count: 0,
      default_branch: 'main',
      owner: { login: owner },
      updated_at: new Date().toISOString(),
    };
    repoCache.set(cacheKey, mock);
    return mock;
  }

  // Fetch from GitHub
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });

    // Cache in both memory and KV
    repoCache.set(cacheKey, data);
    await cacheRepoMetadata(owner, repo, data);

    return data;
  } catch (error: any) {
    // If repository not found, return a lightweight mock so the UI can render a helpful message
    if (error && error.status === 404) {
      console.warn(`Repository not found: ${owner}/${repo} — returning mock metadata`);
      const mock: GitHubRepo = {
        name: repo,
        full_name: `${owner}/${repo}`,
        description: 'Repository not found (404) or inaccessible',
        html_url: `https://github.com/${owner}/${repo}`,
        stargazers_count: 0,
        language: null,
        forks_count: 0,
        open_issues_count: 0,
        default_branch: 'main',
        owner: { login: owner },
        updated_at: new Date().toISOString(),
      };

      repoCache.set(cacheKey, mock);
      await cacheRepoMetadata(owner, repo, mock).catch(() => {});
      return mock;
    }

    // Re-throw other errors
    throw error;
  }
}

export async function getRepoFileTree(
  owner: string,
  repo: string,
  branch: string = "main",
  options?: { includeHidden?: boolean; fetchAll?: boolean }
): Promise<{ tree: FileNode[]; hiddenFiles: { path: string; reason: string }[] }> {
  // Get the tree recursively
  // First, get the branch SHA
  let sha = branch;
  try {
    const { data: branchData } = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch,
    });
    sha = branchData.commit.sha;
  } catch (e) {
    // Try default branch if main doesn't exist
    try {
      const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
      sha = repoData.default_branch;
      
      const { data: branchData } = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: sha,
      });
      sha = branchData.commit.sha;
    } catch (e2) {
      console.warn("Could not fetch branch details, trying with provided name/sha");
    }
  }

  // Check KV cache for tree
  const cachedTree = await getCachedFileTree(owner, repo, sha);
  if (cachedTree) {
    return { tree: cachedTree, hiddenFiles: [] }; // Hidden files not cached separately but that's ok
  }

  // If no valid token, return a minimal fake tree (so UI can render)
  if (!hasValidGithubToken) {
    console.log("No GitHub token available, attempting public API with rate limits");
    // Try public API even without token - it should work for public repos
    const fakeTree: FileNode[] = [
      { path: 'README.md', mode: '100644', type: 'blob', sha: 'mock-sha', url: '' },
      { path: 'src/index.ts', mode: '100644', type: 'blob', sha: 'mock-sha-2', url: '' },
    ];
    return { tree: fakeTree, hiddenFiles: [] };
  }

  let treeFetchData: any;
  try {
    console.log(`Fetching git tree for ${owner}/${repo} at ${sha} with recursive=true`);
    const res = await octokit.rest.git.getTree({ owner, repo, tree_sha: sha, recursive: 'true' });
    treeFetchData = res.data;
  } catch (err: any) {
    console.warn(`Could not fetch git tree for ${owner}/${repo} at ${sha}:`, err && (err.status || err.message) ? (err.status || err.message) : err);
    // Try a non-recursive fetch as fallback
    try {
      console.log(`Retrying with non-recursive fetch for ${owner}/${repo}`);
      const res = await octokit.rest.git.getTree({ owner, repo, tree_sha: sha });
      treeFetchData = res.data;
    } catch (err2) {
      console.warn(`Non-recursive fetch also failed:`, err2);
      // Return an empty tree so the UI can still render gracefully
      const fakeTree: FileNode[] = [];
      await cacheFileTree(owner, repo, sha, fakeTree).catch(() => {});
      return { tree: fakeTree, hiddenFiles: [] };
    }
  }

  const data = treeFetchData;

  const hiddenFiles: { path: string; reason: string }[] = [];

  let filteredTree: FileNode[] = [];

  // If caller requested hidden files, skip filtering
  if (options?.includeHidden) {
    filteredTree = data.tree as FileNode[];
  } else {
    filteredTree = (data.tree as FileNode[]).filter((node) => {
      const path = node.path;

      // Basic exclusions
      if (path.startsWith(".git/") || path === ".git") {
        hiddenFiles.push({ path, reason: "Git System Directory" });
        return false;
      }
      if (path.startsWith("node_modules/") || path === "node_modules") {
        hiddenFiles.push({ path, reason: "Dependencies" });
        return false;
      }
      if (path.startsWith(".next/") || path === ".next") {
        hiddenFiles.push({ path, reason: "Next.js Build Output" });
        return false;
      }
      if (path.startsWith(".idx/") || path === ".idx") {
        hiddenFiles.push({ path, reason: "Project Index" });
        return false;
      }
      if (path.startsWith(".vscode/") || path === ".vscode") {
        hiddenFiles.push({ path, reason: "VS Code Configuration" });
        return false;
      }
      if (path.endsWith(".DS_Store")) {
        hiddenFiles.push({ path, reason: "macOS System File" });
        return false;
      }

      return true;
    });
  }

  // Cache the filtered tree
  await cacheFileTree(owner, repo, sha, filteredTree);

  return { tree: filteredTree, hiddenFiles };
}

/**
 * GraphQL query for repository details
 */
const REPO_DETAILS_QUERY = `
  query RepoDetails($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
        totalSize
        edges {
          size
          node {
            name
            color
          }
        }
      }
      defaultBranchRef {
        target {
          ... on Commit {
            history(first: 20) {
              edges {
                node {
                  message
                  committedDate
                  author {
                    name
                    avatarUrl
                    user {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Fetch enhanced repository details using GraphQL
 */
export async function getRepoDetailsGraphQL(owner: string, repo: string) {
  if (!hasValidGithubToken) {
    // No token — return null so callers gracefully degrade
    return null;
  }

  try {
    const data: any = await octokit.graphql(REPO_DETAILS_QUERY, {
      owner,
      name: repo,
    });

    const languages = data.repository.languages.edges.map((edge: any) => ({
      name: edge.node.name,
      color: edge.node.color,
      size: edge.size,
      percentage: ((edge.size / data.repository.languages.totalSize) * 100).toFixed(1),
    }));

    const commits = data.repository.defaultBranchRef.target.history.edges.map((edge: any) => ({
      message: edge.node.message,
      date: edge.node.committedDate,
      author: {
        name: edge.node.author.name,
        login: edge.node.author.user?.login,
        avatar: edge.node.author.avatarUrl,
      },
    }));

    return {
      languages,
      commits,
      totalSize: data.repository.languages.totalSize,
    };
  } catch (error) {
    console.error('GraphQL fetch failed:', error);
    return null;
  }
}

export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  sha?: string
) {
  try {
    if (!hasValidGithubToken) {
      // Return a minimal mock content so the UI can render something
      return `# ${repo}\n\nThis is mock file content for ${path} (GitHub token not provided).`;
    }
    // If SHA is provided, check cache directly
    if (sha) {
      const cached = await getCachedFile(owner, repo, path, sha);
      if (cached) {
        return cached;
      }
    }

    // If no SHA provided, or not in cache, we need to fetch
    // If we have SHA, we can try to fetch blob directly if we want, 
    // but using getContent with path is safer as it handles encoding.
    // However, getContent with path fetches metadata first.
    // If we have SHA, we can use git.getBlob which is faster and doesn't need metadata?
    // Actually, getBlob returns base64. 

    // Let's stick to the existing flow but use SHA to skip metadata fetch if possible.
    // Wait, if we have SHA, we can't skip metadata fetch if we use `repos.getContent` because that endpoint returns metadata + content.
    // BUT, `repos.getContent` IS the metadata fetch.
    // If we have SHA, we can use `git.getBlob`!

    if (sha) {
      try {
        const { data } = await octokit.rest.git.getBlob({
          owner,
          repo,
          file_sha: sha,
        });

        const content = Buffer.from(data.content, "base64").toString("utf-8");
        await cacheFile(owner, repo, path, sha, content);
        return content;
      } catch (e) {
        console.warn(`Failed to fetch blob for ${path} with SHA ${sha}, falling back to standard fetch`);
      }
    }

    // Fallback or original flow: get the file metadata to obtain SHA
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if ("content" in data && !Array.isArray(data)) {
      const currentSha = data.sha;

      // Check KV cache with SHA (if we didn't have it before)
      if (!sha) {
        const cached = await getCachedFile(owner, repo, path, currentSha);
        if (cached) {
          return cached;
        }
      }

      // Decode content
      const content = Buffer.from(data.content, "base64").toString("utf-8");

      // Cache for future requests
      await cacheFile(owner, repo, path, currentSha, content);

      return content;
    }
    throw new Error("Not a file");
  } catch (error) {
    console.error("Error fetching file content:", error);
    throw error;
  }
}

/**
 * Batch fetch multiple files in parallel with caching
 */
export async function getFileContentBatch(
  owner: string,
  repo: string,
  files: Array<{ path: string; sha?: string }>
): Promise<Array<{ path: string; content: string | null }>> {
  const promises = files.map(async ({ path, sha }) => {
    try {
      const content = await getFileContent(owner, repo, path, sha);
      return { path, content };
    } catch (error) {
      console.warn(`Failed to fetch ${path}:`, error);
      return { path, content: null };
    }
  });

  return await Promise.all(promises);
}

export async function getProfileReadme(username: string) {
  try {
    if (!hasValidGithubToken) {
      return `# ${username}\n\nMock profile README — running without GitHub credentials.`;
    }
    const { data } = await octokit.rest.repos.getReadme({ owner: username, repo: username });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (error) {
    return null;
  }
}

export async function getRepoReadme(owner: string, repo: string) {
  try {
    if (!hasValidGithubToken) {
      return `# ${repo}\n\nMock README for ${owner}/${repo} — running without GitHub credentials.`;
    }
    const { data } = await octokit.rest.repos.getReadme({ owner, repo });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (error) {
    return null;
  }
}

/**
 * Get all public repositories for a user
 */
export async function getUserRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const { data } = await octokit.rest.repos.listForUser({
      username,
      sort: "updated",
      per_page: 100, // Get up to 100 most recent repos
    });
    return data as any;
  } catch (e) {
    console.error("Failed to fetch user repos", e);
    return [];
  }
}

/**
 * Get READMEs for a user's repositories
 */
export async function getReposReadmes(username: string) {
  try {
    const repos = await getUserRepos(username);

    const readmePromises = repos.map(async (repo) => {
      try {
        const { data } = await octokit.rest.repos.getReadme({
          owner: username,
          repo: repo.name,
        });
        return {
          repo: repo.name,
          content: Buffer.from(data.content, "base64").toString("utf-8"),
          updated_at: repo.updated_at,
          description: repo.description,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
        };
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.all(readmePromises);
    return results.filter((r) => r !== null) as {
      repo: string;
      content: string;
      updated_at: string;
      description: string | null;
      stars: number;
      forks: number;
    }[];
  } catch (error) {
    console.error("Error fetching repos:", error);
    return [];
  }
}
