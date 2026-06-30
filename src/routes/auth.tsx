import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Sign in — Leadkeep" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // If a session is already there, bounce straight to the dashboard.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created — you're in");
      }
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* left rail — branded panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground md:flex">
        {/* slow drifting accent blobs */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <Link to="/" className="relative flex items-center gap-2 animate-fade-in">
          <div className="h-7 w-7 rounded-sm bg-accent transition-transform hover:rotate-12" />
          <span className="font-display text-xl">Leadkeep</span>
        </Link>
        <div className="relative animate-fade-in [animation-delay:120ms] [animation-fill-mode:backwards]">
          <p className="font-display text-3xl leading-snug">
            "A lead lost to a forgotten follow-up is the most expensive lead you'll ever have."
          </p>
          <p className="mt-3 text-sm opacity-70">— Every sales lead, ever.</p>
        </div>
        <p className="relative text-xs opacity-60 animate-fade-in [animation-delay:240ms] [animation-fill-mode:backwards]">Admin panel · authorised users only</p>
      </div>

      {/* right — form */}
      <div className="flex items-center justify-center p-6">
        <form onSubmit={onSubmit} key={mode} className="w-full max-w-sm space-y-5 animate-fade-in">
          <div>
            <h1 className="text-3xl font-semibold">
              {mode === "signin" ? "Sign in" : "Create admin account"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Use your admin email and password."
                : "First sign-up becomes the admin. Anyone after will need to be promoted."}
            </p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <input
              type="password" required minLength={6}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>

          <button
            type="submit" disabled={busy}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "Need an account? Create one" : "Have an account? Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
