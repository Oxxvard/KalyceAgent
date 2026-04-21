import { redirect } from "next/navigation";
import { Bell, LogOut } from "lucide-react";

import { KalyceLogo } from "@/components/shell/kalyce-logo";
import { TopNavLink } from "@/components/shell/topnav-link";
import { signOut } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email, organization:organizations(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "client") redirect("/admin");

  const orgName = (profile?.organization as unknown as { name: string } | null)?.name ?? "";
  const initial =
    (profile?.full_name?.trim()?.[0] ?? user.email?.[0] ?? "K").toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-ink-soft/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <KalyceLogo />
            {orgName && (
              <span className="ml-3 hidden border-l border-line pl-3 text-xs text-muted md:inline">
                {orgName}
              </span>
            )}
          </div>
          <nav className="flex items-center gap-1">
            <TopNavLink href="/dashboard" icon="dashboard" label="Tableau de bord" exact />
            <TopNavLink href="/dashboard/roadmap" icon="roadmap" label="Roadmap" />
            <TopNavLink href="/dashboard/documents" icon="documents" label="Documents" />
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative hidden h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-textL hover:bg-surface-hover sm:flex"
              aria-label="Notifications"
            >
              <Bell size={14} strokeWidth={1.6} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-ember" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-xs font-bold text-ink">
                {initial}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-white">
                  {profile?.full_name ?? user.email?.split("@")[0]}
                </div>
                <div className="text-[10px] text-muted">{orgName}</div>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-textL hover:bg-surface-hover"
                title="Déconnexion"
              >
                <LogOut size={14} strokeWidth={1.6} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-7">{children}</main>
    </div>
  );
}
