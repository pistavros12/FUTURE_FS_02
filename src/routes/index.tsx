import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Inbox, MessagesSquare, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Leadkeep — a small CRM for small teams" },
      { name: "description", content: "Capture leads from your contact form, track follow-ups, and convert them. No bloat." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen paper-bg">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-sm bg-primary" />
          <span className="font-display text-xl font-semibold">Leadkeep</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact form</Link>
          <Link to="/auth" className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">
            Admin sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 pt-12">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Mini CRM · lead management
          </p>
          <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
            Every contact form submission, in one tidy place.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Leadkeep collects leads from your website, lets you move them through the
            pipeline, and keeps a paper trail of every follow-up note. Built for
            agencies and freelancers who don't want another bloated CRM.
          </p>
          <div className="mt-7 flex gap-3">
            <Link to="/auth" className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Open dashboard <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-1 rounded-md border px-4 py-2 text-sm font-medium">
              Try the public form
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            { icon: Inbox, t: "Inbox of leads", d: "Submissions land in the dashboard the moment they hit the form." },
            { icon: MessagesSquare, t: "Notes & follow-ups", d: "Log calls and emails against each lead so nothing slips." },
            { icon: BarChart3, t: "Conversion at a glance", d: "See total leads, status breakdown, and conversion rate." },
          ].map((f) => (
            <div key={f.t} className="rounded-lg border bg-card p-5">
              <f.icon className="h-5 w-5 text-accent" />
              <h3 className="mt-3 text-lg font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
