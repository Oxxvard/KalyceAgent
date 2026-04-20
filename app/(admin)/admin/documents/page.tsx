import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatBytes } from "@/lib/documents-data";

const CAT_TONE: Record<string, "gold" | "ember" | "success" | "violet" | "muted"> = {
  legal: "violet",
  financial: "success",
  marketing: "gold",
  operations: "ember",
  other: "muted",
};

export default async function AdminDocumentsPage() {
  const supabase = await createClient();

  const { data: docs } = await supabase
    .from("documents")
    .select(
      "id, name, category, size_bytes, created_at, storage_path, organization:organizations(id, name)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[26px] font-bold text-white mb-1">Bibliothèque</h1>
          <p className="text-[13px] text-muted">Documents et livrables de mission</p>
        </div>
      </div>

      {docs && docs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => {
            const org = d.organization as unknown as { id: string; name: string } | null;
            const ext = d.name.split(".").pop()?.toUpperCase() ?? "DOC";
            const isPdf = ext === "PDF";
            return (
              <div
                key={d.id}
                className="group rounded-xl border border-line bg-surface px-5 py-4 transition-all hover:border-gold/30 hover:bg-surface-hover"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-[11px] font-bold ${isPdf ? "bg-ember/15 text-ember" : "bg-gold/15 text-gold"}`}
                  >
                    {ext}
                  </div>
                  <Badge tone={CAT_TONE[d.category] ?? "muted"}>
                    {categoryLabel(d.category)}
                  </Badge>
                </div>
                <p className="mb-1 text-[13px] font-semibold leading-snug text-white line-clamp-2">
                  {d.name}
                </p>
                <p className="text-[11px] text-muted">
                  {formatBytes(d.size_bytes ?? 0)} ·{" "}
                  {new Date(d.created_at).toLocaleDateString("fr-FR")}
                </p>
                {org && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted">{org.name}</span>
                    <Link
                      href={`/admin/organizations/${org.id}/documents`}
                      className="flex items-center gap-1 text-[11px] text-muted hover:text-gold transition-colors"
                    >
                      Voir <ArrowRight size={11} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center text-[13px] text-muted">
          Aucun document importé. Importez-en via la fiche d&apos;un client.
        </div>
      )}
    </div>
  );
}
