-- Drop incorrect policies
drop policy if exists "Users can upload documents" on storage.objects;
drop policy if exists "Users can view their documents" on storage.objects;
drop policy if exists "Users can delete their documents" on storage.objects;

-- Create corrected policies
create policy "Users can upload documents for their clients"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and
    exists (
      select 1 from public.clients
      where clients.id = (storage.foldername(name))[1]::uuid
      and clients.created_by = auth.uid()
    )
  );

create policy "Users can view documents for their clients"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    exists (
      select 1 from public.clients
      where clients.id = (storage.foldername(name))[1]::uuid
      and clients.created_by = auth.uid()
    )
  );

create policy "Users can delete documents for their clients"
  on storage.objects for delete
  using (
    bucket_id = 'documents' and
    exists (
      select 1 from public.clients
      where clients.id = (storage.foldername(name))[1]::uuid
      and clients.created_by = auth.uid()
    )
  );
