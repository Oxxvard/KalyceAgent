import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { TabsNav } from "@/components/shell/tabs";
import { DeleteOrganizationDialog } from "@/components/shell/delete-organization-dialog";
import { createClient } from "@/lib/supabase/server";

const STAGE_LABEL: Record<string, string> = {
  local: "Local",
  national: "National",
  international: "International",
};

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
    { href: `/admin/organizations/${id}/clients`, label: "Clients" },
  ];

  const badgeTone =
    org.current_stage === "international"
      ? "ember"
      : org.current_stage === "national"
      ? "gold"
      : "muted";

  return (
    <div className="p-8">
      <Link
        href="/admin/organizations"
        className="mb-5 inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-white"
      >
        <ArrowLeft size={13} strokeWidth={1.6} /> Clients
      </Link>
      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gold">
            {org.sector ?? "PME"}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[28px] font-bold text-white">{org.name}</h1>
            <Badge tone={badgeTone as "gold" | "ember" | "muted"}>
              {STAGE_LABEL[org.current_stage] ?? org.current_stage}
            </Badge>
            <span className="text-[12px] text-muted">
              → {STAGE_LABEL[org.target_stage] ?? org.target_stage}
            </span>
          </div>
          <DeleteOrganizationDialog
            orgId={org.id}
            orgName={org.name}
          />
        </div>
      </header>
      <TabsNav tabs={tabs} />
      <div className="mt-7">{children}</div>
    </div>
  );
}
