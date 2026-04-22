/**
 * GitHub API helpers.
 *
 * Fetches public repositories for a GitHub organization and maps them to the
 * Project shape used across the site.
 *
 * Set GITHUB_TOKEN in your environment / Vercel project settings to raise the
 * API rate limit from 60 to 5,000 requests per hour.
 */

import type { Project } from "@/lib/mock-data";

// ── GitHub REST API response shape (subset we care about) ─────────────────────

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  topics: string[];
  html_url: string;
  homepage: string | null;
  archived: boolean;
  fork: boolean;
  pushed_at: string;
  language: string | null;
}

// ── Mapping ───────────────────────────────────────────────────────────────────

function repoToProject(repo: GitHubRepo): Project {
  // Derive status from GitHub metadata
  let status: Project["status"] = "active";
  if (repo.archived) {
    status = "archived";
  } else if (repo.topics.includes("wip")) {
    status = "wip";
  }

  // Build tags: start with the primary language, then add topics (skip "wip"
  // since it's already encoded in status). Cap at 6 to keep the UI tidy.
  const tags: string[] = [];
  if (repo.language) tags.push(repo.language);
  for (const topic of repo.topics) {
    if (topic !== "wip" && !tags.includes(topic) && tags.length < 6) {
      tags.push(topic);
    }
  }

  return {
    id: repo.name,
    title: repo.name,
    description: repo.description ?? "No description provided.",
    tags,
    repo: repo.html_url,
    url: repo.homepage ?? undefined,
    status,
  };
}

// ── Fetcher ───────────────────────────────────────────────────────────────────

/**
 * Returns all non-fork public repos for the given GitHub org, sorted by most
 * recently pushed. Results are cached by Next.js and revalidated every hour.
 *
 * Returns `null` on any API error so the caller can fall back gracefully.
 */
export async function fetchOrgRepos(org: string): Promise<Project[] | null> {
  const reqHeaders: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    reqHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  let res: Response;
  try {
    res = await fetch(
      `https://api.github.com/orgs/${encodeURIComponent(org)}/repos?per_page=100&sort=pushed&direction=desc&type=public`,
      {
        headers: reqHeaders,
        next: { revalidate: 3600 }, // ISR: re-fetch at most once per hour
      }
    );
  } catch (err) {
    console.error("[github] fetch failed:", err);
    return null;
  }

  if (!res.ok) {
    console.error(
      `[github] API error ${res.status} for org "${org}":`,
      await res.text().catch(() => "")
    );
    return null;
  }

  const repos: GitHubRepo[] = await res.json();

  return repos
    .filter((r) => !r.fork)
    .map(repoToProject);
}
