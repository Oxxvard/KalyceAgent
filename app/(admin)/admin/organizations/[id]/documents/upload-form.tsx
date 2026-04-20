"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Upload } from "lucide-react";

import { Input, Label, Select } from "@/components/ui/input";
import { uploadDocument } from "@/app/actions/organizations";

type State = { error?: string; info?: string };

async function submit(_prev: State, formData: FormData): Promise<State> {
  return uploadDocument(formData);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-[13px] font-semibold text-ink hover:bg-gold-soft disabled:opacity-50"
    >
      <Upload size={13} strokeWidth={1.6} />
      {pending ? "Envoi…" : "Importer"}
    </button>
  );
}

export function UploadForm({ organizationId }: { organizationId: string }) {
  const [state, formAction] = useActionState(submit, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.info) formRef.current?.reset();
  }, [state.info]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="organization_id" value={organizationId} />
      <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
        <div>
          <Label htmlFor="file">Fichier</Label>
          <Input id="file" name="file" type="file" required />
        </div>
        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Select id="category" name="category" defaultValue="other">
            <option value="legal">Juridique</option>
            <option value="financial">Financier</option>
            <option value="marketing">Marketing</option>
            <option value="operations">Opérations</option>
            <option value="other">Autre</option>
          </Select>
        </div>
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
