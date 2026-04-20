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

  const sections = [
    {
      title: "Cabinet",
      rows: [
        { label: "Nom du cabinet", value: "Kalyce Consulting" },
        { label: "Email contact", value: "contact@kalyce-consulting.fr" },
        { label: "Adresse", value: "Paris, France" },
      ],
    },
    {
      title: "Profil consultant",
      rows: [
        { label: "Nom complet", value: profile?.full_name ?? "—" },
        { label: "Email", value: profile?.email ?? "—" },
        { label: "Rôle", value: profile?.role ?? "—" },
      ],
    },
    {
      title: "Notifications",
      rows: [
        { label: "Rapport hebdomadaire", value: "Activé" },
        { label: "Alertes score client", value: "Si < 50" },
        { label: "Digest mensuel", value: "Activé" },
      ],
    },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-display text-[26px] font-bold text-white mb-1">Paramètres</h1>
      <p className="text-[13px] text-muted mb-7">Configuration du cabinet et préférences</p>

      <div className="space-y-5">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border border-line overflow-hidden">
            <div className="border-b border-line px-5 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-gold">
              {section.title}
            </div>
            {section.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between border-b border-line px-5 py-3.5 last:border-b-0 hover:bg-surface transition-colors"
              >
                <span className="text-[13px] text-textL">{row.label}</span>
                <span className="text-[13px] font-medium text-white">{row.value}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
