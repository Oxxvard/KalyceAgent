import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-midnight">Paramètres</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profil consultant</CardTitle>
        </CardHeader>
        <dl className="grid gap-3 text-sm">
          <Row label="Nom" value={profile?.full_name ?? "—"} />
          <Row label="Email" value={profile?.email ?? ""} />
          <Row label="Rôle" value={profile?.role ?? ""} />
        </dl>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 last:border-b-0">
      <dt className="text-slate-deep/70">{label}</dt>
      <dd className="font-medium text-midnight">{value}</dd>
    </div>
  );
}
