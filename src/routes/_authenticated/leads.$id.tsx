import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { addNote, getLead, listNotes, updateLeadStatus, STATUS_META, type LeadStatus } from "@/lib/leads";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, Mail, Phone, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/leads/$id")({
  head: () => ({ meta: [{ title: "Lead — Leadkeep" }] }),
  component: LeadDetail,
});

function LeadDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);

  const leadQ = useQuery({ queryKey: ["lead", id], queryFn: () => getLead(id) });
  const notesQ = useQuery({ queryKey: ["lead-notes", id], queryFn: () => listNotes(id) });

  const lead = leadQ.data;

  async function changeStatus(s: LeadStatus) {
    if (!lead) return;
    try {
      await updateLeadStatus(lead.id, s);
      qc.invalidateQueries({ queryKey: ["lead", id] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Marked as ${STATUS_META[s].label}`);
    } catch (e: any) { toast.error(e.message); }
  }

  async function submitNote(e: React.FormEvent) {
    e.preventDefault();
    const t = noteText.trim();
    if (t.length < 1) return;
    setBusy(true);
    try {
      await addNote(id, t);
      setNoteText("");
      qc.invalidateQueries({ queryKey: ["lead-notes", id] });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  if (leadQ.isLoading) return <div className="p-8 text-muted-foreground">Loading…</div>;
  if (!lead) return (
    <div className="p-8">
      <p>That lead doesn't exist.</p>
      <button onClick={() => navigate({ to: "/leads" })} className="mt-3 underline">Back to leads</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link to="/leads" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All leads
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-3">
        {/* Header card */}
        <div className="lg:col-span-3 rounded-lg border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Lead</p>
              <h1 className="font-display text-3xl">{lead.name}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{lead.email}</span>
                {lead.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{lead.phone}</span>}
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />
                  Updated {new Date(lead.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={lead.status} />
              <select
                value={lead.status}
                onChange={(e) => changeStatus(e.target.value as LeadStatus)}
                className="rounded-md border bg-background px-2 py-1 text-sm"
              >
                {(Object.keys(STATUS_META) as LeadStatus[]).map((s) => (
                  <option key={s} value={s}>Move to: {STATUS_META[s].label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold">Add a follow-up note</h2>
            <form onSubmit={submitNote} className="mt-3 space-y-2">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Called Sarah, leaving message. Will retry Thursday morning."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="flex justify-end">
                <button disabled={busy || noteText.trim().length === 0}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
                  {busy ? "Saving…" : "Save note"}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-lg border bg-card">
            <h2 className="border-b px-5 py-3 text-sm font-semibold">Activity</h2>
            {notesQ.isLoading ? (
              <p className="p-5 text-sm text-muted-foreground">Loading…</p>
            ) : (notesQ.data ?? []).length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No notes yet. Be the first to log a follow-up.</p>
            ) : (
              <ul className="divide-y">
                {notesQ.data!.map((n) => (
                  <li key={n.id} className="px-5 py-3">
                    <p className="whitespace-pre-wrap text-sm">{n.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.author_email ?? "Admin"} · {new Date(n.created_at).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Side details */}
        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-5 text-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Source</p>
            <p className="mt-1 font-medium">{lead.source}</p>
          </div>
          <div className="rounded-lg border bg-card p-5 text-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Created</p>
            <p className="mt-1">{new Date(lead.created_at).toLocaleString()}</p>
          </div>
          <div className="rounded-lg border bg-card p-5 text-sm">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Last contacted</p>
            <p className="mt-1">{lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleString() : "—"}</p>
          </div>
          {lead.message && (
            <div className="rounded-lg border bg-card p-5 text-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Original message</p>
              <p className="mt-1 whitespace-pre-wrap">{lead.message}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
