-- Données de développement.
-- À exécuter UNIQUEMENT en local après `supabase db reset`.
-- Crée 1 consultant + 1 PME démo + 1 client lié, avec quelques métriques et checklists.

-- IDs fixes pour faciliter le debug
do $$
declare
  consultant_uid uuid := '00000000-0000-0000-0000-000000000001';
  client_uid     uuid := '00000000-0000-0000-0000-000000000002';
  org_uid        uuid := '11111111-1111-1111-1111-111111111111';
begin
  -- Utilisateurs auth (mot de passe : "growthos2026")
  insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
  values
    (consultant_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'consultant@growth-os.dev', crypt('growthos2026', gen_salt('bf')), now(), now(), now(), '', ''),
    (client_uid,     '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client@growth-os.dev',     crypt('growthos2026', gen_salt('bf')), now(), now(), now(), '', '')
  on conflict (id) do nothing;

  -- Le trigger handle_new_user a créé les profiles avec role='client'.
  -- On promeut le consultant.
  update public.profiles set role = 'consultant', full_name = 'Consultant Démo' where id = consultant_uid;
  update public.profiles set full_name = 'Client Démo' where id = client_uid;

  -- Organisation démo
  insert into public.organizations (id, name, sector, current_stage, target_stage, founded_year, consultant_id)
  values (org_uid, 'Acme PME', 'Services B2B', 'local', 'national', 2021, consultant_uid)
  on conflict (id) do nothing;

  update public.profiles set organization_id = org_uid where id = client_uid;

  -- Snapshots de métriques (3 derniers trimestres)
  insert into public.growth_metrics (organization_id, period_start, period_end, revenue, cac, ltv, fte, gross_margin_pct, notes) values
    (org_uid, '2025-07-01', '2025-09-30', 220000, 280, 720, 4.5, 52.5, 'Q3 2025'),
    (org_uid, '2025-10-01', '2025-12-31', 285000, 240, 780, 5.0, 54.0, 'Q4 2025'),
    (org_uid, '2026-01-01', '2026-03-31', 340000, 220, 820, 5.5, 56.0, 'Q1 2026')
  on conflict (organization_id, period_start, period_end) do nothing;

  -- Instancie toutes les checklists pour l'organisation, statut pending par défaut.
  insert into public.checklists (organization_id, template_id, status)
  select org_uid, id, 'pending'
  from public.checklist_templates
  on conflict (organization_id, template_id) do nothing;

  -- Marque quelques étapes "local" comme validées pour la démo
  update public.checklists
    set status = 'done',
        validated_at = now(),
        validated_by = consultant_uid
  where organization_id = org_uid
    and template_id in (
      select id from public.checklist_templates
      where stage = 'local' and position in (1, 2, 3, 5)
    );
end $$;
