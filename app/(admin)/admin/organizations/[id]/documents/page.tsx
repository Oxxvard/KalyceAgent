import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatBytes, loadDocuments } from "@/lib/documents-data";

import { DeleteDocumentForm } from "./delete-form";
import { UploadForm } from "./upload-form";

const CAT_TONE: Record<string, "gold" | "ember" | "success" | "violet" | "muted"> = {
  legal: "violet",
  financial: "success",
  marketing: "gold",
  operations: "ember",
  other: "muted",
};

export default async function OrgDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const docs = await loadDocuments(supabase, id);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="mb-4 text-[13px] font-semibold text-white">Importer un document</div>
        <UploadForm organizationId={id} />
      </div>

      {docs.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="group rounded-xl border border-line bg-surface px-5 py-4 transition-all hover:border-gold/30 hover:bg-surface-hover"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-[11px] font-bold text-gold">
                  {d.name.split(".").pop()?.toUpperCase() ?? "DOC"}
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
              <div className="mt-3 flex items-center gap-2">
                {d.signedUrl && (
                  <a
                    href={d.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[11px] font-medium text-textL hover:text-gold hover:border-gold/40 transition-colors"
                  >
                    <Download size={11} strokeWidth={1.6} /> Télécharger
                  </a>
                )}
                <DeleteDocumentForm documentId={d.id} organizationId={id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line px-6 py-16 text-center text-[13px] text-muted">
          Aucun document importé.
        </div>
      )}
    </div>
  );
}
