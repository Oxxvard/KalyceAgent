import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Card } from "@/components/ui/card";

import { NewOrgForm } from "./new-org-form";

export default function NewOrganizationPage() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <Link
        href="/admin/organizations"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-deep/70 hover:text-midnight"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux clients
      </Link>
      <h1 className="mb-1 text-2xl font-semibold text-midnight">Nouveau client</h1>
      <p className="mb-8 text-sm text-slate-deep/80">
        Crée une organisation, instancie sa roadmap et provisionne un compte utilisateur client.
      </p>

      <Card>
        <NewOrgForm />
      </Card>
    </div>
  );
}
