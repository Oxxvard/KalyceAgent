import { AuditWizard } from "./audit-wizard";
import { createClient } from "@/lib/supabase/server";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name")
    .order("name");

  return (
    <div className="p-8">
      <h1 className="font-display text-[26px] font-bold text-white mb-1">
        Générateur d&apos;Audit
      </h1>
      <p className="text-[13px] text-muted mb-7">
        Évaluez chaque dimension et générez un rapport stratégique IA
      </p>
      <AuditWizard organizations={orgs ?? []} />
    </div>
  );
}
