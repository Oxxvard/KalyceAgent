import { createClient } from "@/lib/supabase/server";
import { PasswordForm, ProfileForm } from "./settings-forms";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-display text-[26px] font-bold text-white mb-1">Paramètres</h1>
      <p className="text-[13px] text-muted mb-7">
        Profil consultant et accès au compte
      </p>

      <div className="space-y-5">
        <section className="rounded-xl border border-line bg-surface overflow-hidden">
          <div className="border-b border-line px-5 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-gold">
            Profil
          </div>
          <ProfileForm
            defaultName={profile?.full_name ?? ""}
            email={profile?.email ?? user?.email ?? ""}
          />
        </section>

        <section className="rounded-xl border border-line bg-surface overflow-hidden">
          <div className="border-b border-line px-5 py-3 text-[11px] font-bold uppercase tracking-[0.07em] text-gold">
            Mot de passe
          </div>
          <PasswordForm />
        </section>
      </div>
    </div>
  );
}
