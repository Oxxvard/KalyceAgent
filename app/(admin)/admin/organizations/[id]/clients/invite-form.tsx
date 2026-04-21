"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Input, Label } from "@/components/ui/input";
import { inviteClientToOrganization } from "@/app/actions/organizations";

type State = { error?: string; info?: string };

async function submit(_prev: State, formData: FormData): Promise<State> {
  return inviteClientToOrganization(formData);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-[12px] font-semibold text-ink hover:bg-gold-soft disabled:opacity-50"
    >
      {pending ? "En cours…" : "Inviter le client"}
    </button>
  );
}

export function InviteClientForm({ organizationId }: { organizationId: string }) {
  const [state, formAction] = useActionState(submit, {});
  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="organization_id" value={organizationId} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="client_email">Email</Label>
          <Input
            id="client_email"
            name="client_email"
            type="email"
            placeholder="contact@entreprise.fr"
            required
          />
        </div>
        <div>
          <Label htmlFor="client_name">Nom complet</Label>
          <Input id="client_name" name="client_name" placeholder="Jean Dupont" />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe (optionnel)</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Laisser vide pour génération automatique"
          />
        </div>
      </div>
      {state.error && (
        <p className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-[12px] text-ember">
          {state.error}
        </p>
      )}
      {state.info && (
        <div className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-[12px] text-gold">
          {state.info}
        </div>
      )}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
