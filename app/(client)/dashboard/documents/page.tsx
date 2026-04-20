import { redirect } from "next/navigation";
import { Download, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { categoryLabel, formatBytes, loadDocuments } from "@/lib/documents-data";

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
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-slate-deep/80">Aucune organisation associée pour l'instant.</p>
      </div>
    );
  }

  const docs = await loadDocuments(supabase, profile.organization_id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-midnight">Coffre-fort documentaire</h1>
        <p className="mt-1 text-sm text-slate-deep/80">
          Tous les livrables et documents partagés par votre consultant.
        </p>
      </header>

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
                  {formatBytes(d.sizeBytes)} ·{" "}
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
            </li>
          ))}
          {docs.length === 0 && (
            <li className="px-6 py-12 text-center text-sm text-slate-deep/60">
              Aucun document pour l'instant.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
