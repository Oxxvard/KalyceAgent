import { redirect } from "next/navigation";
import { FileText, LayoutDashboard, ListChecks, LogOut, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-screen bg-slate-soft">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-midnight text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-midnight">Growth OS</p>
              {orgName && <p className="text-xs text-slate-deep/70">{orgName}</p>}
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <TopNavLink href="/dashboard" icon={LayoutDashboard} label="Tableau de bord" exact />
            <TopNavLink href="/dashboard/roadmap" icon={ListChecks} label="Roadmap" />
            <TopNavLink href="/dashboard/documents" icon={FileText} label="Documents" />
          </nav>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{profile?.email}</span>
            </Button>
          </form>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
