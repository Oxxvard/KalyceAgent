import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { KalyceLogo } from "@/components/shell/kalyce-logo";
import { NotificationsBell } from "@/components/shell/notifications-bell";
import { SidebarLink, SidebarSection } from "@/components/shell/sidebar-link";
import { signOut } from "@/app/actions/auth";
import { loadNotifications } from "@/lib/notifications-data";
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

  const notifications = await loadNotifications(supabase, user.id);

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "Consultant";
  const initial = displayName[0]?.toUpperCase() ?? "K";

  return (
    <div className="flex h-screen overflow-hidden bg-ink">
      <aside className="flex w-[228px] shrink-0 flex-col overflow-hidden border-r border-line bg-ink-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <KalyceLogo />
        </div>

        <nav className="flex-1 overflow-y-auto p-3 pt-5">
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
          <div className="flex items-center gap-2.5 rounded-lg bg-surface px-2.5 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-xs font-bold text-ink">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-white">
                {displayName}
              </div>
              <div className="truncate text-[10px] text-muted">{profile?.email}</div>
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
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] shrink-0 items-center justify-end gap-3 border-b border-line bg-ink-soft px-6">
          <NotificationsBell initial={notifications} />
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-ember text-xs font-bold text-ink">
              {initial}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-white">{displayName}</div>
              <div className="text-[10px] text-muted">Kalyce Consulting</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-ink">{children}</main>
      </div>
    </div>
  );
}
