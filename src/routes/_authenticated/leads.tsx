import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listLeads, updateLeadStatus, STATUS_META, DEFAULT_SOURCES, type LeadStatus, type Lead } from "@/lib/leads";
import { StatusBadge } from "@/components/StatusBadge";
import { Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads — Leadkeep" }] }),
  component: LeadsLayout,
});

// This route doubles as a layout: /leads renders the list, /leads/:id
// renders the detail. When a detail path is active we hand off to <Outlet />.
function LeadsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/leads") return <Outlet />;
  return <LeadsList />;
}

function LeadsList() {
  const qc = useQueryClient();
  const { data: leads = [], isLoading } = useQuery({ queryKey: ["leads"], queryFn: listLeads });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const sources = useMemo(() => {
    const set = new Set<string>(DEFAULT_SOURCES);
    leads.forEach((l) => set.add(l.source));
    return Array.from(set);
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
      if (!q) return true;
      return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q);
    });
  }, [leads, search, statusFilter, sourceFilter]);

  async function quickStatus(lead: Lead, status: LeadStatus) {
    try {
      await updateLeadStatus(lead.id, status);
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Moved to ${STATUS_META[status].label}`);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">All leads</p>
          <h1 className="text-3xl font-semibold">Pipeline</h1>
        </div>
        <Link to="/add-lead" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add lead
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 rounded-lg border bg-card p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-md border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm">
          <option value="all">All sources</option>
          {sources.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3 hidden md:table-cell">Email</th>
              <th className="px-4 py-3 hidden lg:table-cell">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden md:table-cell">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading leads…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No leads match these filters.</td></tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">
                  <Link to="/leads/$id" params={{ id: l.id }} className="hover:underline">{l.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{l.email}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{l.source}</td>
                <td className="px-4 py-3">
                  <select
                    value={l.status}
                    onChange={(e) => quickStatus(l, e.target.value as LeadStatus)}
                    className="rounded-md border bg-background px-2 py-1 text-xs"
                  >
                    {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_META[s].label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                  {new Date(l.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to="/leads/$id" params={{ id: l.id }} className="text-xs text-muted-foreground hover:text-foreground">
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {leads.length}
      </p>
    </div>
  );
}

// Tiny re-export so the unused StatusBadge import keeps tree-shaking honest.
export { StatusBadge };
