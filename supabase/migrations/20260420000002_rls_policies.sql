-- Growth OS — Row Level Security
-- Stratégie : 2 helpers SECURITY DEFINER lus par toutes les policies.
-- Le helper évite les boucles RLS (la lecture de profiles depuis une policy de
-- profiles déclencherait une récursion infinie).

create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

alter table public.profiles            enable row level security;
alter table public.organizations       enable row level security;
alter table public.growth_metrics      enable row level security;
alter table public.checklist_templates enable row level security;
alter table public.checklists          enable row level security;
alter table public.documents           enable row level security;
alter table public.scalability_scores  enable row level security;

-- profiles : self-read pour tous, all-read pour consultant ; chacun met à jour son profil.
create policy "profiles_self_or_consultant_read" on public.profiles
  for select using (id = auth.uid() or public.current_role() = 'consultant');

create policy "profiles_self_update" on public.profiles
  for update using (id = auth.uid());

create policy "profiles_consultant_write" on public.profiles
  for all
  using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

-- organizations
create policy "organizations_read_scoped" on public.organizations
  for select using (
    public.current_role() = 'consultant'
    or id = public.current_org_id()
  );

create policy "organizations_consultant_write" on public.organizations
  for all
  using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

-- growth_metrics
create policy "growth_metrics_read_scoped" on public.growth_metrics
  for select using (
    public.current_role() = 'consultant'
    or organization_id = public.current_org_id()
  );

create policy "growth_metrics_consultant_write" on public.growth_metrics
  for all
  using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

-- checklist_templates : catalogue global, lecture pour authentifiés
create policy "checklist_templates_read_authenticated" on public.checklist_templates
  for select using (auth.uid() is not null);

create policy "checklist_templates_consultant_write" on public.checklist_templates
  for all
  using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

-- checklists
create policy "checklists_read_scoped" on public.checklists
  for select using (
    public.current_role() = 'consultant'
    or organization_id = public.current_org_id()
  );

create policy "checklists_consultant_write" on public.checklists
  for all
  using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

-- documents (métadonnées ; binaire dans storage.objects, voir migration 3)
create policy "documents_read_scoped" on public.documents
  for select using (
    public.current_role() = 'consultant'
    or organization_id = public.current_org_id()
  );

create policy "documents_consultant_write" on public.documents
  for all
  using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

-- scalability_scores : insertion via route API (consultant), lecture scoped
create policy "scalability_scores_read_scoped" on public.scalability_scores
  for select using (
    public.current_role() = 'consultant'
    or organization_id = public.current_org_id()
  );

create policy "scalability_scores_consultant_insert" on public.scalability_scores
  for insert with check (public.current_role() = 'consultant');
