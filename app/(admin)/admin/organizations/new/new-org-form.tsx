"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { createOrganizationWithClient } from "@/app/actions/organizations";

type State = { error?: string; info?: string };

async function submit(_prev: State, formData: FormData): Promise<State> {
  return createOrganizationWithClient(formData);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Création en cours…" : "Créer le client"}
    </Button>
  );
}

export function NewOrgForm() {
  const [state, formAction] = useActionState(submit, {});

  return (
    <form action={formAction} className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nom de l'organisation *</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="sector">Secteur</Label>
          <Input id="sector" name="sector" placeholder="Services B2B, retail, ..." />
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

      <section className="border-t border-slate-100 pt-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-deep/70">
          Utilisateur client
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="client_email">Email client *</Label>
            <Input id="client_email" name="client_email" type="email" required />
          </div>
          <div>
            <Label htmlFor="client_name">Nom complet</Label>
            <Input id="client_name" name="client_name" />
          </div>
        </div>
      </section>

      {state.error && (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}
      {state.info && (
        <div className="rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          {state.info}
          <p className="mt-1 text-xs text-emerald-700/80">
            Transmettez ce mot de passe au client — il ne sera plus affiché.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <SubmitButton />
      </div>
    </form>
  );
}
