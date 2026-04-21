-- Notifications in-app : un destinataire par ligne, déclenchées par les events métier.

create type notification_type as enum (
  'document_uploaded',
  'metric_added',
  'checklist_done',
  'checklist_in_progress',
  'client_invited',
  'organization_created'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_recipient_unread
  on public.notifications (recipient_id, created_at desc)
  where read_at is null;

create index idx_notifications_recipient_all
  on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notif read own" on public.notifications for select
  using (recipient_id = auth.uid());

create policy "notif update own" on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- Helper: trouve les membres d'une org (clients + consultant assigné).
create or replace function public.org_recipients(org_id uuid, exclude_actor uuid default null)
returns setof uuid
language sql stable security definer set search_path = public as $$
  select p.id
  from public.profiles p
  where p.organization_id = org_id
     or p.id = (select consultant_id from public.organizations where id = org_id)
  except
  select exclude_actor where exclude_actor is not null
$$;

-- Trigger : document uploadé → notifier membres de l'org (sauf uploader)
create or replace function public.notify_document_uploaded()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  org_name text;
begin
  select name into org_name from public.organizations where id = new.organization_id;
  insert into public.notifications (recipient_id, organization_id, type, title, body, url)
  select
    rid,
    new.organization_id,
    'document_uploaded',
    'Nouveau document : ' || new.name,
    coalesce(org_name, '') || ' · ' || new.category,
    '/dashboard/documents'
  from public.org_recipients(new.organization_id, new.uploaded_by) rid;
  return new;
end $$;

create trigger trg_notify_document_uploaded
  after insert on public.documents
  for each row execute function public.notify_document_uploaded();

-- Trigger : métrique ajoutée → notifier clients de l'org
create or replace function public.notify_metric_added()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  org_name text;
  period text;
begin
  select name into org_name from public.organizations where id = new.organization_id;
  period := to_char(new.period_start, 'Mon YYYY');
  insert into public.notifications (recipient_id, organization_id, type, title, body, url)
  select
    p.id,
    new.organization_id,
    'metric_added',
    'Nouvelle métrique : ' || period,
    coalesce(org_name, ''),
    '/dashboard'
  from public.profiles p
  where p.organization_id = new.organization_id
    and p.role = 'client';
  return new;
end $$;

create trigger trg_notify_metric_added
  after insert on public.growth_metrics
  for each row execute function public.notify_metric_added();

-- Trigger : étape validée ou en cours → notifier clients
create or replace function public.notify_checklist_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  tmpl record;
  n_type notification_type;
  n_title text;
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'done' then
    n_type := 'checklist_done';
    select title into tmpl from public.checklist_templates where id = new.template_id;
    n_title := 'Étape validée : ' || coalesce(tmpl.title, 'Étape');
  elsif new.status = 'in_progress' then
    n_type := 'checklist_in_progress';
    select title into tmpl from public.checklist_templates where id = new.template_id;
    n_title := 'Étape lancée : ' || coalesce(tmpl.title, 'Étape');
  else
    return new;
  end if;

  insert into public.notifications (recipient_id, organization_id, type, title, url)
  select p.id, new.organization_id, n_type, n_title, '/dashboard/roadmap'
  from public.profiles p
  where p.organization_id = new.organization_id
    and p.role = 'client';
  return new;
end $$;

create trigger trg_notify_checklist_status
  after update on public.checklists
  for each row execute function public.notify_checklist_status();

-- Trigger : nouveau client lié à une org → notifier le consultant
create or replace function public.notify_client_linked()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  org_name text;
  consultant_uid uuid;
begin
  if new.organization_id is null or new.role <> 'client' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.organization_id is not distinct from new.organization_id then
    return new;
  end if;

  select name, consultant_id into org_name, consultant_uid
    from public.organizations where id = new.organization_id;

  if consultant_uid is null then
    return new;
  end if;

  insert into public.notifications (recipient_id, organization_id, type, title, body, url)
  values (
    consultant_uid,
    new.organization_id,
    'client_invited',
    'Client ajouté : ' || coalesce(new.full_name, new.email),
    coalesce(org_name, ''),
    '/admin/organizations/' || new.organization_id::text
  );
  return new;
end $$;

create trigger trg_notify_client_linked
  after insert or update of organization_id on public.profiles
  for each row execute function public.notify_client_linked();
