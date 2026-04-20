import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function OrganizationsListPage() {
  const supabase = await createClient();
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, sector, current_stage, target_stage, created_at")
    .order("created_at", { ascending: false });

  const { data: scores } = await supabase
    .from("scalability_scores")
    .select("organization_id, score, computed_at")
    .order("computed_at", { ascending: false });

  const latestScore = new Map<string, number>();
  scores?.forEach((s) => {
    if (!latestScore.has(s.organization_id)) latestScore.set(s.organization_id, s.score);
  });

  return (
    <div className="mx-auto max-w-6xl px-8 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-midnight">Clients</h1>
          <p className="mt-1 text-sm text-slate-deep/80">Gestion des PME accompagnées.</p>
        </div>
        <Link href="/admin/organizations/new">
          <Button>
            <Plus className="h-4 w-4" /> Nouveau client
          </Button>
        </Link>
      </header>

      <Card className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-soft text-xs uppercase tracking-wide text-slate-deep/70">
            <tr>
              <th className="px-6 py-3 font-medium">Nom</th>
              <th className="px-6 py-3 font-medium">Secteur</th>
              <th className="px-6 py-3 font-medium">Stade</th>
              <th className="px-6 py-3 font-medium">Score</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orgs?.map((org) => {
              const s = latestScore.get(org.id);
              return (
                <tr key={org.id} className="transition-colors hover:bg-slate-soft">
                  <td className="px-6 py-4 font-medium text-midnight">
                    <Link href={`/admin/organizations/${org.id}`} className="hover:underline">
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-deep/80">{org.sector ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-deep/80">
                    {org.current_stage} → {org.target_stage}
                  </td>
                  <td className="px-6 py-4">
                    {s != null ? (
                      <Badge tone={s >= 60 ? "emerald" : s >= 30 ? "amber" : "neutral"}>{s}/100</Badge>
                    ) : (
                      <span className="text-xs text-slate-deep/50">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/organizations/${org.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-midnight hover:underline"
                    >
                      Ouvrir <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!orgs?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-deep/60">
                  Aucun client. Créez-en un pour démarrer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
