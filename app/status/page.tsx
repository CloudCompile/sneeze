import { headers } from "next/headers";
import Layout from "@/components/Layout";
import { getSubdomainFromHost } from "@/lib/subdomain";
import type { ServiceStatus } from "@/lib/mock-data";

interface ServiceCheck {
  id: string;
  name: string;
  status: ServiceStatus;
  latencyMs?: number;
  lastChecked: string;
}

async function checkServiceHealth(url: string): Promise<{ status: ServiceStatus; latencyMs: number }> {
  const startTime = Date.now();
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - startTime;
    const status: ServiceStatus = response.ok ? "operational" : "degraded";
    return { status, latencyMs };
  } catch {
    const latencyMs = Date.now() - startTime;
    return { status: "outage", latencyMs };
  }
}

async function getServiceChecks(): Promise<ServiceCheck[]> {
  const services = [
    { id: "main-site", name: "cjhauser.me", url: "https://cjhauser.me" },
    { id: "projects", name: "projects.cjhauser.me", url: "https://projects.cjhauser.me" },
    { id: "lab", name: "lab.cjhauser.me", url: "https://lab.cjhauser.me" },
    { id: "bot-builder", name: "dbb.cjhauser.me", url: "https://dbb.cjhauser.me" },
    { id: "news", name: "news.cjhauser.me", url: "https://news.cjhauser.me" },
    { id: "status", name: "status.cjhauser.me", url: "https://status.cjhauser.me" },
    { id: "links", name: "links.cjhauser.me", url: "https://links.cjhauser.me" },
  ];

  const checks = await Promise.all(
    services.map(async (service) => {
      const health = await checkServiceHealth(service.url);
      return {
        id: service.id,
        name: service.name,
        status: health.status,
        latencyMs: health.latencyMs,
        lastChecked: new Date().toISOString(),
      };
    })
  );

  return checks;
}

const STATUS_CONFIG: Record<
  ServiceStatus,
  { label: string; dot: string; badge: string }
> = {
  operational: {
    label: "Operational",
    dot: "bg-emerald-400",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-amber-400",
    badge: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  outage: {
    label: "Outage",
    dot: "bg-red-500",
    badge: "text-red-400 bg-red-500/10 border-red-500/20",
  },
};

function OverallStatus({ checks }: { checks: ServiceCheck[] }) {
  const hasOutage = checks.some((c) => c.status === "outage");
  const hasDegraded = checks.some((c) => c.status === "degraded");

  if (hasOutage) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse shrink-0" />
        <p className="font-medium text-red-400">Some systems are experiencing an outage.</p>
      </div>
    );
  }
  if (hasDegraded) {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-amber-400 shrink-0" />
        <p className="font-medium text-amber-400">Some systems are degraded.</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-center gap-3">
      <span className="h-3 w-3 rounded-full bg-emerald-400 shrink-0" />
      <p className="font-medium text-emerald-400">All systems operational.</p>
    </div>
  );
}

export default async function StatusPage() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const subdomain = getSubdomainFromHost(host);
  const serviceChecks = await getServiceChecks();

  return (
    <Layout subdomain={subdomain}>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Status</h1>
          <p className="mt-2 text-slate-400">
            Real-time health of cjhauser.me services.
          </p>
        </header>

        <OverallStatus checks={serviceChecks} />

        <div className="space-y-3">
          {serviceChecks.map((check) => {
            const cfg = STATUS_CONFIG[check.status];
            return (
              <div
                key={check.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className="font-medium">{check.name}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  {check.latencyMs !== undefined && (
                    <span className="text-slate-500 hidden sm:inline">
                      {check.latencyMs} ms
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-slate-600">
          Status checks are performed in real-time via HTTP HEAD requests. Last updated on page load.
        </p>
      </div>
    </Layout>
  );
}
