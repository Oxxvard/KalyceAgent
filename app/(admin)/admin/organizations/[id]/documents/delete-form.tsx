"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
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
    <Button
      size="sm"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm("Supprimer ce document ?")) return;
        const fd = new FormData();
        fd.set("document_id", documentId);
        fd.set("organization_id", organizationId);
        startTransition(() => deleteDocument(fd));
      }}
    >
      <Trash2 className="h-4 w-4 text-rose-500" />
    </Button>
  );
}
