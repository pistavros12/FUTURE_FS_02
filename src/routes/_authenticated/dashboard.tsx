import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listLeads, STATUS_META, type LeadStatus } from "@/lib/leads";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Leadkeep" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: listLeads });

  const total = leads.length;
  const counts: Record<LeadStatus, number> = { new: 0, contacted: 0, converted: 0, lost: 0 };
  for (const l of leads) counts[l.status]++;
  const conversion = total ? Math.round((counts.converted / total) * 100) : 0;
  const recent = leads.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Overview</p>
          <h1 className="text-3xl font-semibold">Pipeline at a glance</h1>
        </div>
        <Link to="/add-lead" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add lead
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric label="Total leads" value={total} />
        <Metric label="New" value={counts.new} accent="var(--status-new)" />
        <Metric label="Converted" value={counts.converted} accent="var(--status-converted)" />
        <Metric label="Conversion" value={`${conversion}%`} accent="var(--accent)" />
      </div>

      {/* status breakdown bar */}
      <div className="mt-6 rounded-lg border bg-card p-5">
        <h2 className="text-sm font-semibold">Status breakdown</h2>
        <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
          {(Object.keys(counts) as LeadStatus[]).map((s) => {
            const pct = total ? (counts[s] / total) * 100 : 0;
            if (!pct) return null;
            return <div key={s} className={STATUS_META[s].dot} style={{ width: `${pct}%` }} title={`${s}: ${counts[s]}`} />;
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {(Object.keys(counts) as LeadStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
              {STATUS_META[s].label} · {counts[s]}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="text-sm font-semibold">Recent leads</h2>
          <Link to="/leads" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {isLoading ? (
          <div className="p-5 text-sm text-muted-foreground">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No leads yet. Share the <Link to="/contact" className="underline">public contact form</Link> or add one manually.
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((l) => (
              <li key={l.id}>
                <Link to="/leads/$id" params={{ id: l.id }} className="flex items-center justify-between px-5 py-3 hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.email} · {l.source}</p>
                  </div>
                  <StatusBadge status={l.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl" style={accent ? { color: accent } : undefined}>{value}</p>
    </div>
  );
}
