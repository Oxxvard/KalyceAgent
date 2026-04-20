-- Growth OS — Initial schema
-- Tables : profiles, organizations, growth_metrics, checklist_templates,
--          checklists, documents, scalability_scores

create type user_role as enum ('consultant', 'client');
create type org_stage as enum ('local', 'national', 'international');
create type checklist_status as enum ('pending', 'in_progress', 'done', 'skipped');
create type document_category as enum ('legal', 'financial', 'marketing', 'operations', 'other');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  organization_id uuid,
  full_name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  current_stage org_stage not null default 'local',
  target_stage org_stage not null default 'national',
  founded_year int,
  consultant_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_organization_fk
  foreign key (organization_id) references public.organizations(id) on delete set null;

create table public.growth_metrics (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  revenue numeric(14,2),
  cac numeric(10,2),
  ltv numeric(10,2),
  fte numeric(6,2),
  gross_margin_pct numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  unique (organization_id, period_start, period_end)
);

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  stage org_stage not null,
  position int not null,
  title text not null,
  description text,
  weight int not null default 1,
  unique (stage, position)
);

create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid not null references public.checklist_templates(id) on delete restrict,
  status checklist_status not null default 'pending',
  validated_at timestamptz,
  validated_by uuid references public.profiles(id) on delete set null,
  notes text,
  unique (organization_id, template_id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category document_category not null default 'other',
  name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.scalability_scores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  score int not null check (score between 0 and 100),
  breakdown jsonb not null,
  computed_at timestamptz not null default now()
);

-- À chaque nouvel utilisateur auth, on crée son profil (rôle 'client' par défaut).
-- Le consultant promeut manuellement les utilisateurs admin dans la table profiles.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

create trigger organizations_touch_updated_at
  before update on public.organizations
  for each row execute procedure public.touch_updated_at();

create index idx_growth_metrics_org_period on public.growth_metrics(organization_id, period_start desc);
create index idx_checklists_org on public.checklists(organization_id);
create index idx_documents_org on public.documents(organization_id);
create index idx_scores_org_time on public.scalability_scores(organization_id, computed_at desc);
create index idx_profiles_org on public.profiles(organization_id);
create index idx_organizations_consultant on public.organizations(consultant_id);
