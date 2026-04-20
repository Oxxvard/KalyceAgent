import { redirect } from "next/navigation";
import { Building2, LayoutDashboard, LogOut, Settings, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarLink } from "@/components/shell/sidebar-link";
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

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-midnight text-white">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Growth OS</p>
            <p className="text-xs text-white/60">Consultant</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          <SidebarLink href="/admin" icon={LayoutDashboard} label="Vue d'ensemble" exact />
          <SidebarLink href="/admin/organizations" icon={Building2} label="Clients" />
          <SidebarLink href="/admin/settings" icon={Settings} label="Paramètres" />
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-3 text-xs text-white/70">
            <p className="truncate">{profile?.full_name ?? user.email}</p>
            <p className="truncate text-white/50">{profile?.email}</p>
          </div>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
