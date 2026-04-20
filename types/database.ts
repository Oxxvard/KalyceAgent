// Placeholder types — à régénérer via `npm run db:gen-types` une fois Supabase démarré.
// Ces types minimalistes permettent au projet de compiler avant la 1ère génération.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "consultant" | "client";
export type OrgStage = "local" | "national" | "international";
export type ChecklistStatus = "pending" | "in_progress" | "done" | "skipped";
export type DocumentCategory =
  | "legal"
  | "financial"
  | "marketing"
  | "operations"
  | "other";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          organization_id: string | null;
          full_name: string | null;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          organization_id?: string | null;
          full_name?: string | null;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          sector: string | null;
          current_stage: OrgStage;
          target_stage: OrgStage;
          founded_year: number | null;
          consultant_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sector?: string | null;
          current_stage?: OrgStage;
          target_stage?: OrgStage;
          founded_year?: number | null;
          consultant_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      growth_metrics: {
        Row: {
          id: string;
          organization_id: string;
          period_start: string;
          period_end: string;
          revenue: number | null;
          cac: number | null;
          ltv: number | null;
          fte: number | null;
          gross_margin_pct: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["growth_metrics"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["growth_metrics"]["Insert"]>;
      };
      checklist_templates: {
        Row: {
          id: string;
          stage: OrgStage;
          position: number;
          title: string;
          description: string | null;
          weight: number;
        };
        Insert: Omit<Database["public"]["Tables"]["checklist_templates"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["checklist_templates"]["Insert"]>;
      };
      checklists: {
        Row: {
          id: string;
          organization_id: string;
          template_id: string;
          status: ChecklistStatus;
          validated_at: string | null;
          validated_by: string | null;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["checklists"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["checklists"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          organization_id: string;
          category: DocumentCategory;
          name: string;
          storage_path: string;
          mime_type: string | null;
          size_bytes: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      scalability_scores: {
        Row: {
          id: string;
          organization_id: string;
          score: number;
          breakdown: Json;
          computed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["scalability_scores"]["Row"], "id" | "computed_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["scalability_scores"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_role: { Args: Record<string, never>; Returns: UserRole };
      current_org_id: { Args: Record<string, never>; Returns: string | null };
    };
    Enums: {
      user_role: UserRole;
      org_stage: OrgStage;
      checklist_status: ChecklistStatus;
      document_category: DocumentCategory;
    };
  };
}
