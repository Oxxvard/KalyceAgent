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
export type NotificationType =
  | "document_uploaded"
  | "metric_added"
  | "checklist_done"
  | "checklist_in_progress"
  | "client_invited"
  | "organization_created";

type ProfilesRow = {
  id: string;
  role: UserRole;
  organization_id: string | null;
  full_name: string | null;
  email: string;
  created_at: string;
  updated_at: string;
};

type OrganizationsRow = {
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

type GrowthMetricsRow = {
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

type ChecklistTemplatesRow = {
  id: string;
  stage: OrgStage;
  position: number;
  title: string;
  description: string | null;
  weight: number;
};

type ChecklistsRow = {
  id: string;
  organization_id: string;
  template_id: string;
  status: ChecklistStatus;
  validated_at: string | null;
  validated_by: string | null;
  notes: string | null;
};

type DocumentsRow = {
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

type ScalabilityScoresRow = {
  id: string;
  organization_id: string;
  score: number;
  breakdown: Json;
  computed_at: string;
};

type NotificationsRow = {
  id: string;
  recipient_id: string;
  organization_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  url: string | null;
  read_at: string | null;
  created_at: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: ProfilesRow;
        Insert: {
          id: string;
          role?: UserRole;
          organization_id?: string | null;
          full_name?: string | null;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ProfilesRow>;
        Relationships: [];
      };
      organizations: {
        Row: OrganizationsRow;
        Insert: {
          id?: string;
          name: string;
          sector?: string | null;
          current_stage?: OrgStage;
          target_stage?: OrgStage;
          founded_year?: number | null;
          consultant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<OrganizationsRow>;
        Relationships: [];
      };
      growth_metrics: {
        Row: GrowthMetricsRow;
        Insert: {
          id?: string;
          organization_id: string;
          period_start: string;
          period_end: string;
          revenue?: number | null;
          cac?: number | null;
          ltv?: number | null;
          fte?: number | null;
          gross_margin_pct?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<GrowthMetricsRow>;
        Relationships: [];
      };
      checklist_templates: {
        Row: ChecklistTemplatesRow;
        Insert: {
          id?: string;
          stage: OrgStage;
          position: number;
          title: string;
          description?: string | null;
          weight?: number;
        };
        Update: Partial<ChecklistTemplatesRow>;
        Relationships: [];
      };
      checklists: {
        Row: ChecklistsRow;
        Insert: {
          id?: string;
          organization_id: string;
          template_id: string;
          status?: ChecklistStatus;
          validated_at?: string | null;
          validated_by?: string | null;
          notes?: string | null;
        };
        Update: Partial<ChecklistsRow>;
        Relationships: [];
      };
      documents: {
        Row: DocumentsRow;
        Insert: {
          id?: string;
          organization_id: string;
          category?: DocumentCategory;
          name: string;
          storage_path: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<DocumentsRow>;
        Relationships: [];
      };
      scalability_scores: {
        Row: ScalabilityScoresRow;
        Insert: {
          id?: string;
          organization_id: string;
          score: number;
          breakdown: Json;
          computed_at?: string;
        };
        Update: Partial<ScalabilityScoresRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationsRow;
        Insert: {
          id?: string;
          recipient_id: string;
          organization_id?: string | null;
          type: NotificationType;
          title: string;
          body?: string | null;
          url?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: Partial<NotificationsRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
      current_org_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
    };
    Enums: {
      user_role: UserRole;
      org_stage: OrgStage;
      checklist_status: ChecklistStatus;
      document_category: DocumentCategory;
      notification_type: NotificationType;
    };
    CompositeTypes: Record<string, never>;
  };
};
