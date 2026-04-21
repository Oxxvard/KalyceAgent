import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { detachClientFromOrganization } from "@/app/actions/organizations";
import { InviteClientForm } from "./invite-form";

export default async function OrgClientsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!org) notFound();

  const { data: clients } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .eq("organization_id", id)
    .eq("role", "client")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-line bg-surface p-5">
        <div className="mb-4">
          <h2 className="text-[14px] font-semibold text-white">Inviter un client</h2>
          <p className="mt-1 text-[12px] text-muted">
            Crée un compte d&apos;accès ou rattache un utilisateur existant à{" "}
            <span className="text-textL">{org.name}</span>.
          </p>
        </div>
        <InviteClientForm organizationId={id} />
      </section>

      <section className="rounded-xl border border-line bg-surface overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <span className="text-[14px] font-semibold text-white">Clients rattachés</span>
          <span className="ml-3 text-[11px] text-muted">
            {clients?.length ?? 0} utilisateur{(clients?.length ?? 0) > 1 ? "s" : ""}
          </span>
        </div>
        {clients && clients.length > 0 ? (
          <ul>
            {clients.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-b-0 transition-colors hover:bg-surface-raised"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-[12px] font-bold text-ink">
                  {(c.full_name?.[0] ?? c.email[0]).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-white">
                    {c.full_name ?? c.email.split("@")[0]}
                  </p>
                  <p className="truncate text-[11px] text-muted">{c.email}</p>
                </div>
                <span className="hidden sm:inline text-[11px] text-muted">
                  Ajouté le{" "}
                  {new Date(c.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <form action={detachClientFromOrganization}>
                  <input type="hidden" name="organization_id" value={id} />
                  <input type="hidden" name="user_id" value={c.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-line bg-ink px-2.5 py-1.5 text-[11px] text-muted transition-colors hover:border-ember/40 hover:text-ember"
                    title="Retirer de l'organisation"
                  >
                    Retirer
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-[12px] text-muted">
            Aucun client rattaché. Utilisez le formulaire ci-dessus pour en inviter.
          </p>
        )}
      </section>
    </div>
  );
}
