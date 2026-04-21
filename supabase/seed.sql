-- Seed de démarrage minimal.
-- Crée UNIQUEMENT le compte consultant initial pour se connecter au portail.
-- Tout le reste (organisations, clients, métriques, documents) est créé depuis le portail.
--
-- Identifiants de connexion après `supabase db reset` :
--   consultant@kalyce.local / kalyce2026

do $$
declare
  consultant_uid uuid := '00000000-0000-0000-0000-000000000001';
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    confirmation_token, recovery_token
  )
  values (
    consultant_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'consultant@kalyce.local',
    crypt('kalyce2026', gen_salt('bf')),
    now(), now(), now(), '', ''
  )
  on conflict (id) do nothing;

  -- Le trigger handle_new_user a créé le profile avec role='client' — on le promeut.
  update public.profiles
    set role = 'consultant', full_name = 'Consultant Kalyce'
    where id = consultant_uid;
end $$;
