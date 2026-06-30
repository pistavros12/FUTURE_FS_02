import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, PlusCircle, LogOut, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: ShellLayout,
});

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/add-lead", label: "Add lead", icon: PlusCircle },
] as const;

function ShellLayout() {
  const { user } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — narrow, dark, label-first. Different from the typical
          shadcn sidebar widget on purpose. */}
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="h-6 w-6 rounded-sm bg-accent" />
          <span className="font-display text-lg">Leadkeep</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {navItems.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                  active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"
                }`}
              >
                <it.icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-sm">
          <Link to="/contact" target="_blank" className="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs opacity-70 hover:opacity-100">
            <ExternalLink className="h-3.5 w-3.5" /> Open public form
          </Link>
          <div className="rounded-md bg-sidebar-accent/40 px-3 py-2">
            <p className="truncate text-xs opacity-70">Signed in as</p>
            <p className="truncate text-sm">{user?.email}</p>
          </div>
          <button onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-sidebar-accent/60">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>

      {/* mobile top bar */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-sm bg-primary" />
            <span className="font-display">Leadkeep</span>
          </Link>
          <button onClick={signOut} className="text-sm">Log out</button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b bg-card px-2 md:hidden">
          {navItems.map((it) => {
            const active = pathname === it.to || pathname.startsWith(it.to + "/");
            return (
              <Link key={it.to} to={it.to} className={`whitespace-nowrap px-3 py-2 text-sm ${active ? "border-b-2 border-accent font-medium" : "text-muted-foreground"}`}>
                {it.label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
