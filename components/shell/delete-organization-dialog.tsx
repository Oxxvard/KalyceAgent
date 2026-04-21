"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";

import { deleteOrganization } from "@/app/actions/organizations";

export function DeleteOrganizationDialog({
  orgId,
  orgName,
}: {
  orgId: string;
  orgName: string;
}) {
  const [open, setOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const confirmationText = `Je supprime ${orgName}`;
  const isTextCorrect = typedText === confirmationText;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTextCorrect || !confirmed) return;

    startTransition(async () => {
      const result = await deleteOrganization(orgId);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setTypedText("");
        setConfirmed(false);
        setError(undefined);
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-ember hover:bg-ember/10 transition-colors"
        title="Supprimer cette organisation"
      >
        <Trash2 size={14} strokeWidth={1.8} />
        Supprimer
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl border border-line bg-ink-soft shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ember/15">
                <Trash2 size={16} className="text-ember" strokeWidth={2} />
              </div>
              <h2 className="text-[15px] font-semibold text-white">
                Supprimer {orgName}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted hover:text-white transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div className="rounded-lg bg-ember/10 border border-ember/20 px-4 py-3">
              <p className="text-[12px] text-ember font-medium">
                ⚠️ Cette action est irréversible
              </p>
              <p className="text-[11px] text-ember/70 mt-1">
                Tous les documents, métriques et données de cette organisation seront supprimés
                définitivement.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-ember/40 bg-ember/10 px-3 py-2 text-[12px] text-ember">
                {error}
              </p>
            )}

            {/* Confimation Text */}
            <div>
              <label className="text-[12px] font-semibold text-white mb-2 block">
                Tape cette phrase pour confirmer :
              </label>
              <p className="text-[13px] text-gold font-mono bg-gold/5 px-3 py-2 rounded-lg mb-3 border border-gold/20">
                {confirmationText}
              </p>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Taper ici…"
                className="w-full px-3 py-2.5 rounded-lg border border-line bg-surface text-white placeholder-muted text-[13px] focus:outline-none focus:border-gold transition-colors"
              />
              {typedText && !isTextCorrect && (
                <p className="text-[11px] text-ember mt-1">❌ Texte incorrect</p>
              )}
              {isTextCorrect && (
                <p className="text-[11px] text-success mt-1">✓ Texte correct</p>
              )}
            </div>

            {/* Checkbox Confirmation */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={!isTextCorrect}
                className="h-4 w-4 mt-1 rounded border border-line bg-surface checked:bg-ember checked:border-ember cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
              <span className="text-[12px] text-muted">
                J'accepte la suppression définitive de{" "}
                <span className="text-white font-semibold">{orgName}</span>
              </span>
            </label>

            {/* Footer */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-line bg-transparent px-4 py-2.5 text-[13px] font-medium text-white hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!isTextCorrect || !confirmed || isPending}
                className="flex-1 rounded-lg bg-ember px-4 py-2.5 text-[13px] font-medium text-white hover:bg-ember-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
