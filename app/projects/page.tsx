import { headers } from "next/headers";
import Layout from "@/components/Layout";
import { getSubdomainFromHost } from "@/lib/subdomain";
import { projects as mockProjects } from "@/lib/mock-data";
import { fetchOrgRepos } from "@/lib/github";

const STATUS_COLORS: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  wip: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  archived: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export default async function ProjectsPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const subdomain = getSubdomainFromHost(host);

  // Fetch live repos from the CloudCompile GitHub org; fall back to mock data
  // if the API is unavailable (e.g. rate-limited without a token).
  const githubRepos = await fetchOrgRepos("CloudCompile");
  const projects = githubRepos ?? mockProjects;
  const isLive = githubRepos !== null;

  return (
    <Layout subdomain={subdomain}>
      <div className="space-y-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="mt-2 text-slate-400">Things I&apos;m building or have built.</p>
          </div>
          {isLive && (
            <a
              href="https://github.com/CloudCompile"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 text-sm text-slate-400 hover:text-sky-400 transition-colors"
            >
              <span>🐙</span>
              <span>CloudCompile on GitHub</span>
            </a>
          )}
        </header>

        {!isLive && (
          <p className="text-xs text-slate-600">
            Showing cached data — set <code className="font-mono">GITHUB_TOKEN</code> to load live repos.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-5 flex flex-col gap-3 hover:border-sky-500/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-lg">{project.title}</h2>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[project.status]}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="text-sm text-slate-400 flex-1">{project.description}</p>

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {(project.url || project.repo) && (
                <div className="flex gap-3 text-sm pt-1">
                  {project.repo && (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      Repo →
                    </a>
                  )}
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      Live →
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

