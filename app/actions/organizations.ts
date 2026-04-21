"use server";

import { randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrgStage } from "@/types/database";

type ActionResult = { error?: string; info?: string };

function generatePassword() {
  return randomBytes(9).toString("base64url");
}

export async function createOrganizationWithClient(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim() || null;
  const currentStage = String(formData.get("current_stage") ?? "local") as OrgStage;
  const targetStage = String(formData.get("target_stage") ?? "national") as OrgStage;
  const clientEmail = String(formData.get("client_email") ?? "").trim();
  const clientName = String(formData.get("client_name") ?? "").trim() || null;

  if (!name || !clientEmail) {
    return { error: "Nom de l'organisation et email client requis." };
  }

  const supabase = await createClient();
  const {
    data: { user: consultant },
  } = await supabase.auth.getUser();
  if (!consultant) return { error: "Session consultant introuvable." };

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({
      name,
      sector,
      current_stage: currentStage,
      target_stage: targetStage,
      consultant_id: consultant.id,
    })
    .select("id")
    .single();

  if (orgError || !org) {
    return { error: orgError?.message ?? "Création impossible" };
  }

  const { data: templates } = await supabase.from("checklist_templates").select("id");
  if (templates?.length) {
    await supabase
      .from("checklists")
      .insert(templates.map((t) => ({ organization_id: org.id, template_id: t.id })));
  }

  const admin = createAdminClient();
  const tempPassword = generatePassword();
  const { data: created, error: userError } = await admin.auth.admin.createUser({
    email: clientEmail,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: clientName },
  });

  if (userError || !created.user) {
    return { error: `Organisation créée mais compte client en erreur : ${userError?.message ?? "inconnu"}` };
  }

  await admin
    .from("profiles")
    .update({ organization_id: org.id, full_name: clientName })
    .eq("id", created.user.id);

  revalidatePath("/admin/organizations");
  revalidatePath("/admin");
  return {
    info: `Client créé. Mot de passe temporaire : ${tempPassword}`,
  };
}

export async function updateChecklistStatus(formData: FormData): Promise<void> {
  const orgId = String(formData.get("organization_id") ?? "");
  const checklistId = String(formData.get("checklist_id") ?? "");
  const nextStatus = String(formData.get("next_status") ?? "");

  if (!orgId || !checklistId || !["pending", "in_progress", "done", "skipped"].includes(nextStatus)) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const validated = nextStatus === "done";
  await supabase
    .from("checklists")
    .update({
      status: nextStatus as "pending" | "in_progress" | "done" | "skipped",
      validated_at: validated ? new Date().toISOString() : null,
      validated_by: validated ? user.id : null,
    })
    .eq("id", checklistId)
    .eq("organization_id", orgId);

  revalidatePath(`/admin/organizations/${orgId}`);
  revalidatePath(`/admin/organizations/${orgId}/roadmap`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/roadmap");
}

export async function addGrowthMetric(formData: FormData): Promise<ActionResult> {
  const orgId = String(formData.get("organization_id") ?? "");
  const periodStart = String(formData.get("period_start") ?? "");
  const periodEnd = String(formData.get("period_end") ?? "");
  const revenue = parseNumber(formData.get("revenue"));
  const cac = parseNumber(formData.get("cac"));
  const ltv = parseNumber(formData.get("ltv"));
  const fte = parseNumber(formData.get("fte"));
  const grossMargin = parseNumber(formData.get("gross_margin_pct"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!orgId || !periodStart || !periodEnd) {
    return { error: "Période (début et fin) et organisation requises." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("growth_metrics").insert({
    organization_id: orgId,
    period_start: periodStart,
    period_end: periodEnd,
    revenue,
    cac,
    ltv,
    fte,
    gross_margin_pct: grossMargin,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/organizations/${orgId}`);
  revalidatePath(`/admin/organizations/${orgId}/metrics`);
  revalidatePath("/dashboard");
  return { info: "Métrique ajoutée." };
}

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function uploadDocument(formData: FormData): Promise<ActionResult> {
  const orgId = String(formData.get("organization_id") ?? "");
  const category = String(formData.get("category") ?? "other");
  const file = formData.get("file");

  if (!orgId || !(file instanceof File) || file.size === 0) {
    return { error: "Fichier et organisation requis." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${orgId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(path, file, { contentType: file.type || undefined, upsert: false });

  if (uploadError) return { error: uploadError.message };

  const { error: dbError } = await supabase.from("documents").insert({
    organization_id: orgId,
    category: category as "legal" | "financial" | "marketing" | "operations" | "other",
    name: file.name,
    storage_path: path,
    mime_type: file.type || null,
    size_bytes: file.size,
    uploaded_by: user.id,
  });

  if (dbError) {
    await supabase.storage.from("documents").remove([path]);
    return { error: dbError.message };
  }

  revalidatePath(`/admin/organizations/${orgId}/documents`);
  revalidatePath("/dashboard/documents");
  return { info: "Document importé." };
}

export async function deleteDocument(formData: FormData): Promise<void> {
  const orgId = String(formData.get("organization_id") ?? "");
  const documentId = String(formData.get("document_id") ?? "");
  if (!orgId || !documentId) return;

  const supabase = await createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("storage_path")
    .eq("id", documentId)
    .maybeSingle();

  if (doc?.storage_path) {
    await supabase.storage.from("documents").remove([doc.storage_path]);
  }
  await supabase.from("documents").delete().eq("id", documentId);

  revalidatePath(`/admin/organizations/${orgId}/documents`);
  revalidatePath("/dashboard/documents");
}

export async function recomputeScore(orgId: string): Promise<void> {
  if (!orgId) return;
  const host = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await fetch(`${host}/api/scalability-score/${orgId}`, { method: "POST", cache: "no-store" }).catch(
    () => undefined,
  );
  revalidatePath(`/admin/organizations/${orgId}`);
  revalidatePath("/dashboard");
}

export async function redirectToOrg(id: string): Promise<never> {
  redirect(`/admin/organizations/${id}`);
}

export async function inviteClientToOrganization(
  formData: FormData,
): Promise<ActionResult> {
  const orgId = String(formData.get("organization_id") ?? "").trim();
  const email = String(formData.get("client_email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("client_name") ?? "").trim() || null;

  if (!orgId || !email) {
    return { error: "Email et organisation requis." };
  }

  const supabase = await createClient();
  const {
    data: { user: consultant },
  } = await supabase.auth.getUser();
  if (!consultant) return { error: "Session expirée." };

  const { data: orgRow } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", orgId)
    .maybeSingle();
  if (!orgRow) return { error: "Organisation introuvable." };

  const admin = createAdminClient();

  // Recherche un profile existant par email (profiles.email est synchronisé via le trigger signup).
  const { data: existing } = await admin
    .from("profiles")
    .select("id, organization_id, role")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    if (existing.role !== "client") {
      return { error: "Cet utilisateur existe déjà mais n'est pas un client." };
    }
    const { error: linkError } = await admin
      .from("profiles")
      .update({ organization_id: orgId, full_name: fullName })
      .eq("id", existing.id);
    if (linkError) return { error: linkError.message };

    revalidatePath(`/admin/organizations/${orgId}`);
    revalidatePath(`/admin/organizations/${orgId}/clients`);
    return { info: `${email} rattaché à ${orgRow.name}.` };
  }

  // Nouveau compte : crée l'utilisateur avec mot de passe temporaire.
  const tempPassword = generatePassword();
  const { data: created, error: userError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (userError || !created.user) {
    return { error: userError?.message ?? "Création du compte impossible." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ organization_id: orgId, full_name: fullName })
    .eq("id", created.user.id);
  if (profileError) return { error: profileError.message };

  revalidatePath(`/admin/organizations/${orgId}`);
  revalidatePath(`/admin/organizations/${orgId}/clients`);
  return {
    info: `Compte créé pour ${email}. Mot de passe temporaire : ${tempPassword}`,
  };
}

export async function detachClientFromOrganization(
  formData: FormData,
): Promise<void> {
  const orgId = String(formData.get("organization_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");
  if (!orgId || !userId) return;

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ organization_id: null })
    .eq("id", userId)
    .eq("organization_id", orgId);

  revalidatePath(`/admin/organizations/${orgId}/clients`);
  revalidatePath(`/admin/organizations/${orgId}`);
}
