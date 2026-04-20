"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { deleteDocument } from "@/app/actions/organizations";

export function DeleteDocumentForm({
  documentId,
  organizationId,
}: {
  documentId: string;
  organizationId: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ember hover:bg-ember/10 disabled:opacity-50 transition-colors"
      onClick={() => {
        if (!confirm("Supprimer ce document ?")) return;
        const fd = new FormData();
        fd.set("document_id", documentId);
        fd.set("organization_id", organizationId);
        startTransition(() => deleteDocument(fd));
      }}
    >
      <Trash2 size={13} strokeWidth={1.6} />
    </button>
  );
}
