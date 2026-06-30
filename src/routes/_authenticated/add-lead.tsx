import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { createLead, DEFAULT_SOURCES } from "@/lib/leads";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/add-lead")({
  head: () => ({ meta: [{ title: "Add lead — Leadkeep" }] }),
  component: AddLead,
});

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional(),
  source: z.string().min(1).max(60),
  message: z.string().trim().max(2000).optional(),
});

function AddLead() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", source: DEFAULT_SOURCES[1], message: "",
  });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    try {
      const lead = await createLead({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        source: parsed.data.source,
        message: parsed.data.message || null,
      });
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead added");
      nav({ to: "/leads/$id", params: { id: lead.id } });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link to="/leads" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All leads
      </Link>
      <h1 className="mt-3 font-display text-3xl">Add a lead manually</h1>
      <p className="mt-1 text-sm text-muted-foreground">For calls, walk-ins, referrals — anything that didn't come through the website.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Email">
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </Field>
          <Field label="Phone (optional)">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </Field>
          <Field label="Source">
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input">
              {DEFAULT_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Notes / context (optional)">
          <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input" />
        </Field>
        <div className="flex justify-end">
          <button disabled={busy} className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
            {busy ? "Saving…" : "Save lead"}
          </button>
        </div>
      </form>

      <style>{`.input{width:100%;border-radius:6px;border:1px solid var(--color-border);background:var(--color-background);padding:.5rem .75rem;font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--color-ring)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
