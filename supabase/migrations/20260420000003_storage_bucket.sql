-- Growth OS — bucket Storage privé pour le coffre-fort numérique.
-- Convention de path : "{organization_id}/{filename}"

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_storage_read_scoped" on storage.objects
  for select using (
    bucket_id = 'documents'
    and (
      public.current_role() = 'consultant'
      or (storage.foldername(name))[1] = public.current_org_id()::text
    )
  );

create policy "documents_storage_consultant_insert" on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and public.current_role() = 'consultant'
  );

create policy "documents_storage_consultant_update" on storage.objects
  for update using (
    bucket_id = 'documents'
    and public.current_role() = 'consultant'
  );

create policy "documents_storage_consultant_delete" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and public.current_role() = 'consultant'
  );
