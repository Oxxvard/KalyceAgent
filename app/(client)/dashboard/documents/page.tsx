import { redirect } from "next/navigation";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatBytes, loadDocuments } from "@/lib/documents-data";

const CAT_TONE: Record<string, "gold" | "ember" | "success" | "violet" | "muted"> = {
  legal: "violet",
  financial: "success",
  marketing: "gold",
  operations: "ember",
  other: "muted",
};

export default async function ClientDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.organization_id) {
    return (
      <div className="py-24 text-center text-[14px] text-muted">
        Aucune organisation associée pour l&apos;instant.
      </div>
    );
  }

  const docs = await loadDocuments(supabase, profile.organization_id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-[26px] font-bold text-white">Bibliothèque</h1>
        <p className="mt-1 text-[13px] text-muted">
          Documents et livrables partagés par votre consultant
        </p>
      </div>

      {docs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => {
            const ext = d.name.split(".").pop()?.toUpperCase() ?? "DOC";
            const isPdf = ext === "PDF";
            return (
              <div
                key={d.id}
                className="group rounded-xl border border-line bg-surface px-5 py-4 transition-all hover:border-gold/30 hover:bg-surface-hover"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-[11px] font-bold ${
                      isPdf ? "bg-ember/15 text-ember" : "bg-gold/15 text-gold"
                    }`}
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
                  {formatBytes(d.sizeBytes)} ·{" "}
                  {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                </p>
                {d.signedUrl && (
                  <a
                    href={d.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line bg-ink px-3 py-1.5 text-[11px] font-medium text-textL hover:text-gold hover:border-gold/40 transition-colors"
                  >
                    <Download size={11} strokeWidth={1.6} /> Télécharger
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center text-[13px] text-muted">
          Aucun document partagé pour l&apos;instant.
        </div>
      )}
    </div>
  );
}
