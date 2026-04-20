"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { uploadDocument } from "@/app/actions/organizations";

type State = { error?: string; info?: string };

async function submit(_prev: State, formData: FormData): Promise<State> {
  return uploadDocument(formData);
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <Upload className="h-4 w-4" />
      {pending ? "Envoi…" : "Importer"}
    </Button>
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
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.error}</p>
      )}
      {state.info && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{state.info}</p>
      )}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
