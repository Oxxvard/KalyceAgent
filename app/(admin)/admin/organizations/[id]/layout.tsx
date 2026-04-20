import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TabsNav } from "@/components/shell/tabs";
import { createClient } from "@/lib/supabase/server";

export default async function OrgDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, sector, current_stage, target_stage")
    .eq("id", id)
    .maybeSingle();

  if (!org) notFound();

  const tabs = [
    { href: `/admin/organizations/${id}`, label: "Vue d'ensemble" },
    { href: `/admin/organizations/${id}/metrics`, label: "Métriques" },
    { href: `/admin/organizations/${id}/roadmap`, label: "Roadmap" },
    { href: `/admin/organizations/${id}/documents`, label: "Documents" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <Link
        href="/admin/organizations"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-deep/70 hover:text-midnight"
      >
        <ArrowLeft className="h-4 w-4" /> Clients
      </Link>
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-midnight">{org.name}</h1>
          <Badge tone="midnight">{org.current_stage}</Badge>
          <Badge>→ {org.target_stage}</Badge>
        </div>
        {org.sector && <p className="mt-1 text-sm text-slate-deep/70">{org.sector}</p>}
      </header>
      <TabsNav tabs={tabs} />
      <div className="mt-8">{children}</div>
    </div>
  );
}
