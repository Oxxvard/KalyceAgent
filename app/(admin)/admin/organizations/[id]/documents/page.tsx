import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatBytes, loadDocuments } from "@/lib/documents-data";

import { DeleteDocumentForm } from "./delete-form";
import { UploadForm } from "./upload-form";

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
      <Card>
        <CardHeader>
          <CardTitle>Importer un document</CardTitle>
        </CardHeader>
        <UploadForm organizationId={id} />
      </Card>

      <Card className="p-0">
        <ul className="divide-y divide-slate-100">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-soft text-slate-deep">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-midnight">{d.name}</p>
                <p className="text-xs text-slate-deep/70">
                  {formatBytes(d.sizeBytes)} · importé le{" "}
                  {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Badge>{categoryLabel(d.category)}</Badge>
              {d.signedUrl && (
                <a
                  href={d.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-midnight hover:underline"
                >
                  <Download className="h-4 w-4" /> Télécharger
                </a>
              )}
              <DeleteDocumentForm documentId={d.id} organizationId={id} />
            </li>
          ))}
          {docs.length === 0 && (
            <li className="px-6 py-12 text-center text-sm text-slate-deep/60">
              Aucun document importé.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
