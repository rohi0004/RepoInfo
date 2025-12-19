import { MetadataRoute } from "next";
import { promises as fs } from "fs";
import path from "path";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = "https://repoinfo.in";

    const results: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
    ];

    // Try to include featured repos from data/featured-repos.json (array of "owner/repo")
    try {
        const dataPath = path.join(process.cwd(), "data", "featured-repos.json");
        const raw = await fs.readFile(dataPath, "utf-8");
        const repos: string[] = JSON.parse(raw || "[]");

        for (const repo of repos) {
            if (typeof repo !== "string") continue;
            const trimmed = repo.trim();
            if (!trimmed) continue;
            results.push({
                url: `${baseUrl}/${trimmed}`,
                lastModified: new Date(),
                changeFrequency: "weekly",
                priority: 0.8,
            });
        }
    } catch (e) {
        // No featured repos file found or parse error - ignore silently
    }

    // Also include recently visited repos (best-effort). These are recorded by the repo page.
    try {
        const recentPath = path.join(process.cwd(), "data", "recent-repos.json");
        const rawRecent = await fs.readFile(recentPath, "utf-8");
        const recent: { repo: string; lastVisited: string }[] = JSON.parse(rawRecent || "[]");

        for (const item of recent.slice(0, 200)) {
            if (!item?.repo) continue;
            results.push({
                url: `${baseUrl}/${item.repo}`,
                lastModified: item.lastVisited ? new Date(item.lastVisited) : new Date(),
                changeFrequency: "monthly",
                priority: 0.6,
            });
        }
    } catch (e) {
        // ignore if not found
    }

    return results;
}
