import type { Database, DocumentCategory } from "@/types/database";

type Supabase = ReturnType<
  typeof import("@supabase/ssr").createServerClient<Database>
>;

export type DocumentWithUrl = {
  id: string;
  name: string;
  category: DocumentCategory;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  signedUrl: string | null;
};

export async function loadDocuments(
  supabase: Supabase,
  organizationId: string,
): Promise<DocumentWithUrl[]> {
  const { data: docs } = await supabase
    .from("documents")
    .select("id, name, category, mime_type, size_bytes, created_at, storage_path")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (!docs?.length) return [];

  const paths = docs.map((d) => d.storage_path);
  const { data: signed } = await supabase.storage
    .from("documents")
    .createSignedUrls(paths, 60 * 60);

  const urlByPath = new Map<string, string>();
  signed?.forEach((s) => {
    if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
  });

  return docs.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    mimeType: d.mime_type,
    sizeBytes: d.size_bytes,
    createdAt: d.created_at,
    signedUrl: urlByPath.get(d.storage_path) ?? null,
  }));
}

export function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  legal: "Juridique",
  financial: "Financier",
  marketing: "Marketing",
  operations: "Opérations",
  other: "Autre",
};

export function categoryLabel(category: DocumentCategory) {
  return CATEGORY_LABEL[category];
}
