import { redirect } from "next/navigation";

import { KalyceLogo } from "@/components/shell/kalyce-logo";
import { NotificationsBell } from "@/components/shell/notifications-bell";
import { SidebarLink, SidebarSection } from "@/components/shell/sidebar-link";
import { MobileMenu } from "@/components/shell/mobile-menu";
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

  const notifications = await loadNotifications(supabase, user.id);

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "Consultant";
  const initial = displayName[0]?.toUpperCase() ?? "K";

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-ink">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden md:flex md:w-[228px] md:shrink-0 md:flex-col md:overflow-hidden md:border-r md:border-line md:bg-ink-soft">
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
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 md:h-[52px] shrink-0 items-center justify-between gap-3 border-b border-line bg-ink-soft px-4 md:px-6">
          {/* Mobile Logo & Menu */}
          <div className="flex md:hidden items-center gap-2">
            <KalyceLogo />
          </div>

          {/* Notifications & Profile */}
          <div className="flex items-center gap-3">
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

            {/* Mobile Menu */}
            <MobileMenu
              role="consultant"
              displayName={displayName}
              email={profile?.email || ""}
              initial={initial}
              onSignOut={signOut}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-ink">{children}</main>
      </div>
    </div>
  );
}
