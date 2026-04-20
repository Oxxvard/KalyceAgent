import { redirect } from "next/navigation";
import { Bell, ChevronsUpDown, LogOut, Search } from "lucide-react";

import { KalyceLogo } from "@/components/shell/kalyce-logo";
import { SidebarLink, SidebarSection } from "@/components/shell/sidebar-link";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "consultant") redirect("/dashboard");

  const initial =
    (profile?.full_name?.trim()?.[0] ?? user.email?.[0] ?? "K").toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-ink">
      <aside className="flex w-[228px] shrink-0 flex-col overflow-hidden border-r border-line bg-ink-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <KalyceLogo />
          <div className="flex h-5 w-5 cursor-pointer flex-col justify-center gap-0.5 opacity-50">
            <div className="h-px w-full rounded bg-muted" />
            <div className="h-px w-3 rounded bg-muted" />
          </div>
        </div>

        <div className="border-b border-line px-3.5 py-3">
          <div className="rounded-lg bg-white/5 px-1 py-1 text-center">
            <span className="inline-block w-1/2 rounded-md bg-gold py-1 text-[11px] font-bold text-ink">
              Consultant
            </span>
            <span className="inline-block w-1/2 py-1 text-[11px] font-semibold text-muted">
              Client PME
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <SidebarSection title="Général">
            <SidebarLink href="/admin" icon="dashboard" label="Dashboard" exact />
            <SidebarLink href="/admin/organizations" icon="users" label="Clients" />
          </SidebarSection>
          <SidebarSection title="Outils">
            <SidebarLink href="/admin/audit" icon="sparkles" label="Audit IA" />
            <SidebarLink href="/admin/roadmap" icon="map" label="Roadmap" />
            <SidebarLink href="/admin/documents" icon="files" label="Documents" />
            <SidebarLink href="/admin/analytics" icon="chart" label="Analytics" />
          </SidebarSection>
          <SidebarSection title="Support">
            <SidebarLink href="/admin/settings" icon="settings" label="Paramètres" />
          </SidebarSection>
        </nav>

        <div className="border-t border-line p-3.5">
          <div className="mb-2.5 flex items-center gap-2.5 rounded-lg bg-surface px-2.5 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-xs font-bold text-ink">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-white">
                {profile?.full_name ?? user.email?.split("@")[0]}
              </div>
              <div className="text-[10px] text-muted">Consultant Senior</div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="text-muted hover:text-white"
                title="Déconnexion"
              >
                <LogOut size={13} strokeWidth={1.6} />
              </button>
            </form>
          </div>
          <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-gold/40 bg-gold/15 px-3 py-2 text-[11px] font-semibold text-gold">
            <span>↑ Mettre à niveau</span>
            <ChevronsUpDown size={12} />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] shrink-0 items-center gap-4 border-b border-line bg-ink-soft px-6">
          <div className="flex max-w-[360px] flex-1 items-center gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-1.5">
            <Search size={14} className="text-muted" />
            <input
              placeholder="Rechercher un client, document…"
              className="flex-1 border-none bg-transparent text-[13px] text-white placeholder:text-muted outline-none"
            />
            <span className="rounded bg-ink-mauve px-1.5 py-0.5 text-[10px] text-muted">
              ⌘K
            </span>
          </div>
          <div className="flex-1" />
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-textL hover:bg-surface-hover"
            aria-label="Notifications"
          >
            <Bell size={15} strokeWidth={1.6} />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-ember" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-ember text-xs font-bold text-ink">
              {initial}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-white">
                {profile?.full_name ?? user.email?.split("@")[0]}
              </div>
              <div className="text-[10px] text-muted">Kalyce Consulting</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-ink">{children}</main>
      </div>
    </div>
  );
}
