"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Input, Label, Select } from "@/components/ui/input";
import { createOrganizationWithClient } from "@/app/actions/organizations";

type State = { error?: string; info?: string };

async function submit(_prev: State, formData: FormData): Promise<State> {
  return createOrganizationWithClient(formData);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-gold-soft disabled:opacity-50"
    >
      {pending ? "Création en cours…" : "Créer le client"}
    </button>
  );
}

export function NewOrgForm() {
  const [state, formAction] = useActionState(submit, {});

  return (
    <form action={formAction} className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nom de l&apos;organisation *</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="sector">Secteur</Label>
          <Input id="sector" name="sector" placeholder="Services B2B, retail…" />
        </div>
        <div>
          <Label htmlFor="current_stage">Stade actuel</Label>
          <Select id="current_stage" name="current_stage" defaultValue="local">
            <option value="local">Local</option>
            <option value="national">National</option>
            <option value="international">International</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="target_stage">Stade cible</Label>
          <Select id="target_stage" name="target_stage" defaultValue="national">
            <option value="local">Local</option>
            <option value="national">National</option>
            <option value="international">International</option>
          </Select>
        </div>
      </section>

      <section className="border-t border-line pt-5">
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
          Utilisateur client
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="client_email">Email client *</Label>
            <Input id="client_email" name="client_email" type="email" required />
          </div>
          <div>
            <Label htmlFor="client_name">Nom complet</Label>
            <Input id="client_name" name="client_name" />
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
      </section>

      {state.error && (
        <p className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2.5 text-[12px] text-ember">
          {state.error}
        </p>
      )}
      {state.info && (
        <div className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-[13px] text-gold">
          <p className="font-semibold">{state.info}</p>
          <p className="mt-1 text-[11px] text-gold/70">
            Transmettez ce mot de passe au client — il ne sera plus affiché.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
