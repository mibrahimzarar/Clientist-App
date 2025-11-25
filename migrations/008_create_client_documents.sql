-- Create client_documents table
create table if not exists public.client_documents (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  name text not null,
  type text not null,
  file_path text not null,
  file_type text not null,
  size bigint default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null
);

-- Enable RLS
alter table public.client_documents enable row level security;

-- Create policies
create policy "Users can view documents for their clients"
  on public.client_documents for select
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_documents.client_id
      and clients.created_by = auth.uid()
    )
  );

create policy "Users can insert documents for their clients"
  on public.client_documents for insert
  with check (
    exists (
      select 1 from public.clients
      where clients.id = client_documents.client_id
      and clients.created_by = auth.uid()
    )
  );

create policy "Users can delete documents for their clients"
  on public.client_documents for delete
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_documents.client_id
      and clients.created_by = auth.uid()
    )
  );

-- Storage bucket setup (if not exists)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can view their documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

create policy "Users can delete their documents"
  on storage.objects for delete
  using (
    bucket_id = 'documents' and
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
