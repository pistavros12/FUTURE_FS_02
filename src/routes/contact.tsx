import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact us — Leadkeep" },
      { name: "description", content: "Get in touch — we'll respond within one business day." },
    ],
  }),
  component: ContactPage,
});

// Keep validation strict — this form is public.
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      source: "Website Contact Form",
      status: "new",
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    setForm({ name: "", email: "", phone: "", message: "" });
  }

  return (
    <div className="min-h-screen paper-bg">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-sm bg-primary" />
          <span className="font-display text-xl font-semibold">Leadkeep</span>
        </Link>
        <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground">Admin sign in</Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-20 pt-6">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Contact</p>
        <h1 className="text-4xl font-semibold">Send us a note</h1>
        <p className="mt-2 text-muted-foreground">
          Drop your details and we'll get back to you. This form goes straight into our CRM.
        </p>

        {sent ? (
          <div className="mt-8 rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold">Got it — thanks.</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We'll be in touch within one business day.
            </p>
            <button onClick={() => setSent(false)} className="mt-4 text-sm underline">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-lg border bg-card p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Your name">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </Field>
              <Field label="Email">
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </Field>
            </div>
            <Field label="Phone (optional)">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <Field label="How can we help?">
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            </Field>
            <button disabled={busy} className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {busy ? "Sending…" : "Send message"}
            </button>
          </form>
        )}
      </main>
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
