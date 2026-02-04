export interface Message {
    id: string;
    role: "user" | "model";
    content: string;
    relevantFiles?: string[];
}

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
    clone_url: string;
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
