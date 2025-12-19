import { RepoLoader } from '@/components/RepoLoader';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ owner: string; repo: string }> | { owner: string; repo: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export const metadata: Metadata = {
  title: 'Repository Chat',
};

export default async function RepoPage({ params }: PageProps) {
  // `params` may be a Promise in Next.js — await it before accessing properties.
  const resolvedParams = await params;
  const { owner, repo } = resolvedParams;
  const query = `${owner}/${repo}`;

  // RepoLoader is a client component that will fetch and render the repo
  // loading UI and eventually the chat UI.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <RepoLoader query={query} />;
}
