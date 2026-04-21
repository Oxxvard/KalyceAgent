"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Input, Label } from "@/components/ui/input";
import { updatePassword, updateProfile } from "@/app/actions/auth";

type State = { error?: string; info?: string };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-gold px-4 py-2 text-[12px] font-semibold text-ink hover:bg-gold-soft disabled:opacity-50"
    >
      {pending ? "Enregistrement…" : label}
    </button>
  );
}

function Feedback({ state }: { state: State }) {
  if (state.error) {
    return (
      <p className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-[12px] text-ember">
        {state.error}
      </p>
    );
  }
  if (state.info) {
    return (
      <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-[12px] text-success">
        {state.info}
      </p>
    );
  }
  return null;
}

export function ProfileForm({
  defaultName,
  email,
}: {
  defaultName: string;
  email: string;
}) {
  const [state, formAction] = useActionState<State, FormData>(updateProfile, {});
  return (
    <form action={formAction} className="space-y-3 p-5">
      <div>
        <Label htmlFor="full_name">Nom complet</Label>
        <Input id="full_name" name="full_name" defaultValue={defaultName} required />
      </div>
      <div>
        <Label>Email (non modifiable)</Label>
        <Input value={email} disabled readOnly />
      </div>
      <Feedback state={state} />
      <div className="flex justify-end">
        <SubmitButton label="Enregistrer" />
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<State, FormData>(updatePassword, {});
  return (
    <form action={formAction} className="space-y-3 p-5" autoComplete="off">
      <div>
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirm">Confirmation</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <Feedback state={state} />
      <div className="flex justify-end">
        <SubmitButton label="Mettre à jour" />
      </div>
    </form>
  );
}
