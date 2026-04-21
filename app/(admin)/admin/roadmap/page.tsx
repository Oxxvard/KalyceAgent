import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ProgressBar } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase/server";

export default async function AdminRoadmapPage() {
  const supabase = await createClient();

  const [{ data: orgs }, { data: checklists }] = await Promise.all([
    supabase.from("organizations").select("id, name, sector, current_stage").order("name"),
    supabase.from("checklists").select("organization_id, status"),
  ]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="font-display text-[22px] sm:text-[24px] md:text-[26px] font-bold text-white mb-1">Roadmap</h1>
      <p className="mb-5 sm:mb-7 text-[12px] sm:text-[13px] text-muted">
        Vue consolidée des roadmaps de croissance par client
      </p>

      <div className="space-y-2 sm:space-y-3">
        {orgs?.map((org) => {
          const items = checklists?.filter((c) => c.organization_id === org.id) ?? [];
          const done = items.filter((c) => c.status === "done").length;
          const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;

          return (
            <div
              key={org.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-5 rounded-xl border border-line bg-surface px-4 sm:px-5 py-3 sm:py-4 transition-all hover:border-gold/30 hover:bg-surface-hover"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[12px] sm:text-[13px] font-semibold text-white mb-0.5">{org.name}</div>
                <div className="text-[10px] sm:text-[11px] text-muted">
                  {org.sector ?? "—"} · {org.current_stage}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto sm:shrink-0">
                <ProgressBar value={pct} className="flex-1 sm:w-40 md:w-52" thickness="md" />
                <span className="w-10 text-right text-[11px] sm:text-[12px] font-semibold text-gold">
                  {pct}%
                </span>
              </div>

              <div className="text-[11px] text-muted shrink-0">
                {done}/{items.length} étapes
              </div>

              <Link
                href={`/admin/organizations/${org.id}/roadmap`}
                className="flex items-center gap-1 text-[12px] font-medium text-muted hover:text-gold shrink-0 transition-colors"
              >
                Ouvrir <ArrowRight size={13} strokeWidth={1.6} />
              </Link>
            </div>
          );
        })}
        {!orgs?.length && (
          <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center text-[13px] text-muted">
            Aucun client pour l&apos;instant.
          </div>
        )}
      </div>
    </div>
  );
}
