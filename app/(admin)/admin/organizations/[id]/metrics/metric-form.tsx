"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { Input, Label, Textarea } from "@/components/ui/input";
import { addGrowthMetric } from "@/app/actions/organizations";

type State = { error?: string; info?: string };

async function submit(_prev: State, formData: FormData): Promise<State> {
  return addGrowthMetric(formData);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-[13px] font-semibold text-ink hover:bg-gold-soft disabled:opacity-50"
    >
      {pending ? "Enregistrement…" : "Ajouter la période"}
    </button>
  );
}

export function MetricForm({ organizationId }: { organizationId: string }) {
  const [state, formAction] = useActionState(submit, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.info) formRef.current?.reset();
  }, [state.info]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="organization_id" value={organizationId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="period_start">Début de période *</Label>
          <Input id="period_start" name="period_start" type="date" required />
        </div>
        <div>
          <Label htmlFor="period_end">Fin de période *</Label>
          <Input id="period_end" name="period_end" type="date" required />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="revenue">CA (€)</Label>
          <Input id="revenue" name="revenue" type="number" step="0.01" />
        </div>
        <div>
          <Label htmlFor="gross_margin_pct">Marge brute (%)</Label>
          <Input id="gross_margin_pct" name="gross_margin_pct" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="fte">ETP</Label>
          <Input id="fte" name="fte" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="cac">CAC (€)</Label>
          <Input id="cac" name="cac" type="number" step="0.01" />
        </div>
        <div>
          <Label htmlFor="ltv">LTV (€)</Label>
          <Input id="ltv" name="ltv" type="number" step="0.01" />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" />
      </div>
      {state.error && (
        <p className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2.5 text-[12px] text-ember">
          {state.error}
        </p>
      )}
      {state.info && (
        <p className="rounded-lg border border-success/40 bg-success/10 px-3 py-2.5 text-[12px] text-success">
          {state.info}
        </p>
      )}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
