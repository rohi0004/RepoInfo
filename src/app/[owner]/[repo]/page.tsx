import { RepoLoader } from '@/components/RepoLoader';
import type { Metadata } from 'next';
import { getRepo, getRepoReadme } from '@/lib/github';
import { promises as fs } from 'fs';
import path from 'path';

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const { owner, repo } = resolvedParams as { owner: string; repo: string };
  const title = `${owner}/${repo} — RepoInfo`;

  // Try to fetch repository details to produce richer metadata (server-side)
  let repoDesc = `Chat with the ${owner}/${repo} repository, analyze code, generate diagrams, and surface insights using RepoInfo.`;
  let topics: string[] = [];
  try {
    const details = await getRepo(owner, repo);
    if (details && details.description) repoDesc = details.description;
    if (details && Array.isArray((details as any).topics)) topics = (details as any).topics;
  } catch (e) {
    // Fallback to generic description on any error
  }

  const description = repoDesc;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://repoinfo.in/${owner}/${repo}`,
      siteName: 'RepoInfo',
      images: [
        {
          url: '/RepoInfo.png',
          alt: 'RepoInfo',
        },
      ],
      type: 'website',
    },
    keywords: [owner, repo, ...(topics || [])].filter(Boolean) as string[],
  } as Metadata;
}

export default async function RepoPage({ params }: { params: any }) {
  const resolvedParams = await Promise.resolve(params);
  const { owner, repo } = resolvedParams as { owner: string; repo: string };
  const query = `${owner}/${repo}`;

  // Fetch README server-side so search engines can index repository content.
  let readme: string | null = null;
  try {
    readme = await getRepoReadme(owner, repo);
  } catch (e) {
    readme = null;
  }

  // Extract an SEO-friendly snippet:
  // 1) Prefer the 'Installation' or 'Usage' section if present.
  // 2) Otherwise return the first ~500 chars of the README (stripped of markdown).
  function stripMarkdown(md: string) {
    return md
      .replace(/```[\s\S]*?```/g, '') // remove code blocks
      .replace(/[#>*_`~\[\]]+/g, '') // basic md chars
      .replace(/\(.*?\)/g, '') // remove parentheses content
      .replace(/\n{2,}/g, '\n')
      .trim();
  }

  function extractSection(md: string, headings: string[]) {
    const lines = md.split(/\r?\n/);
    for (const h of headings) {
      const idx = lines.findIndex(l => l.toLowerCase().startsWith('#') && l.toLowerCase().includes(h.toLowerCase()));
      if (idx !== -1) {
        // collect lines until next heading
        const section = [] as string[];
        for (let i = idx + 1; i < lines.length; i++) {
          if (lines[i].trim().startsWith('#')) break;
          section.push(lines[i]);
          if (section.join(' ').length > 600) break;
        }
        const txt = stripMarkdown(section.join('\n'));
        if (txt.length > 40) return txt;
      }
    }
    return null;
  }

  const preferred = readme ? extractSection(readme, ['installation', 'usage', 'getting started', 'quickstart']) : null;
  let readmeSnippet = '';
  if (preferred) {
    readmeSnippet = preferred.split('\n').slice(0, 5).join(' ').slice(0, 800);
  } else if (readme) {
    const stripped = stripMarkdown(readme);
    readmeSnippet = stripped.replace(/\s+/g, ' ').slice(0, 800);
  }

  // JSON-LD structured data for SoftwareSourceCode and breadcrumbs
  const ld: any = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: `${owner}/${repo}`,
    description: readmeSnippet || `Repository ${owner}/${repo} on GitHub`,
    codeRepository: `https://github.com/${owner}/${repo}`,
    url: `https://repoinfo.in/${owner}/${repo}`,
    author: { "@type": "Person", name: owner },
    keywords: [] as string[],
  };

  try {
    const repoMeta = await getRepo(owner, repo);
    if (repoMeta) {
      if ((repoMeta as any).language) ld.programmingLanguage = (repoMeta as any).language;
      if ((repoMeta as any).description) ld.description = (repoMeta as any).description;
      if ((repoMeta as any).topics) ld.keywords = (repoMeta as any).topics;
      if ((repoMeta as any).updated_at) ld.dateModified = (repoMeta as any).updated_at;
    }
  } catch (e) {
    // ignore
  }

  // Record this repo to a local recent-repos.json for sitemap auto-discovery.
  (async function recordRecent() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const recentPath = path.join(dataDir, 'recent-repos.json');
      await fs.mkdir(dataDir, { recursive: true });

      let recent: { repo: string; lastVisited: string }[] = [];
      try {
        const raw = await fs.readFile(recentPath, 'utf-8');
        recent = JSON.parse(raw || '[]');
      } catch (e) {
        recent = [];
      }

      const key = `${owner}/${repo}`;
      const now = new Date().toISOString();

      // Remove existing entry if present
      recent = recent.filter(r => r.repo !== key);
      // Insert at top
      recent.unshift({ repo: key, lastVisited: now });
      // Keep only latest 200 entries
      recent = recent.slice(0, 200);

      await fs.writeFile(recentPath, JSON.stringify(recent, null, 2), 'utf-8');
    } catch (e) {
      // best-effort, ignore errors
    }
  })();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://repoinfo.in/" },
      { "@type": "ListItem", position: 2, name: owner, item: `https://repoinfo.in/${owner}` },
      { "@type": "ListItem", position: 3, name: repo, item: `https://repoinfo.in/${owner}/${repo}` },
    ],
  };

  // Render a small server-side visible summary to help crawlers and users
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (
    <>
      {/* Canonical link for SEO */}
      <link rel="canonical" href={`https://repoinfo.in/${owner}/${repo}`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main>
        <section aria-labelledby="repo-summary" className="max-w-4xl mx-auto px-4 py-6">
          <h1 id="repo-summary" className="text-2xl font-bold">{owner}/{repo}</h1>
          {ld.description && <p className="mt-2 text-sm text-muted">{ld.description}</p>}
          {readmeSnippet && (
            <article className="mt-3 prose max-w-none text-sm" style={{ color: 'var(--muted)' }}>
              <p>{readmeSnippet}</p>
            </article>
          )}
        </section>

        <RepoLoader query={query} />
      </main>
    </>
  );
}
