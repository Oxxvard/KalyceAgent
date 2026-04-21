import { redirect } from "next/navigation";

import { KalyceLogo } from "@/components/shell/kalyce-logo";
import { NotificationsBell } from "@/components/shell/notifications-bell";
import { TopNavLink } from "@/components/shell/topnav-link";
import { MobileMenu } from "@/components/shell/mobile-menu";
import { signOut } from "@/app/actions/auth";
import { loadNotifications } from "@/lib/notifications-data";
import { createClient } from "@/lib/supabase/server";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email, organization_id")
    .eq("id", user.id)
    .maybeSingle();

  let orgName = "";
  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .maybeSingle();
    orgName = org?.name ?? "";
  }

  const notifications = await loadNotifications(supabase, user.id);

  const displayName =
    profile?.full_name?.trim() || user.email?.split("@")[0] || "Client";
  const initial = displayName[0]?.toUpperCase() ?? "K";

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      {/* Responsive Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-ink-soft/95 backdrop-blur">
        <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 px-4 sm:px-6 py-3 sm:py-3.5">
          {/* Top Row: Logo + Mobile Menu + Notifications */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-3">
              <KalyceLogo />
              {orgName && (
                <span className="hidden sm:inline border-l border-line pl-3 text-xs text-muted">
                  {orgName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <NotificationsBell initial={notifications} />
              <MobileMenu
                role="client"
                displayName={displayName}
                email={profile?.email || ""}
                initial={initial}
                onSignOut={signOut}
              />
            </div>
          </div>

          {/* Desktop Nav + Profile */}
          <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between md:gap-4">
            <div className="flex items-center gap-1">
              <TopNavLink href="/dashboard" icon="dashboard" label="Tableau de bord" exact />
              <TopNavLink href="/dashboard/roadmap" icon="roadmap" label="Roadmap" />
              <TopNavLink href="/dashboard/documents" icon="documents" label="Documents" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-xs font-bold text-ink">
                  {initial}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{displayName}</div>
                  <div className="text-[10px] text-muted">{orgName}</div>
                </div>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface hover:bg-surface text-muted hover:text-white transition-colors"
                  title="Déconnexion"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </form>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 sm:py-7">
          {children}
        </div>
      </main>
    </div>
  );
}
