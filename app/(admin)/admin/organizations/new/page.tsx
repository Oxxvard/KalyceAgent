import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NewOrgForm } from "./new-org-form";

export default function NewOrganizationPage() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <Link
        href="/admin/organizations"
        className="mb-6 inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-white"
      >
        <ArrowLeft size={13} strokeWidth={1.6} /> Retour aux clients
      </Link>
      <h1 className="font-display mb-1 text-[26px] font-bold text-white">Nouveau client</h1>
      <p className="mb-7 text-[13px] text-muted">
        Crée une organisation, instancie la roadmap et provisionne le compte utilisateur.
      </p>

      <div className="rounded-xl border border-line bg-surface p-6">
        <NewOrgForm />
      </div>
    </div>
  );
}
