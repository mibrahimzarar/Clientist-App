-- Create client_tasks table
create table if not exists public.client_tasks (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  due_date timestamp with time zone,
  status text check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  is_reminder_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null
);

-- Enable RLS
alter table public.client_tasks enable row level security;

-- Create policies
create policy "Users can view tasks for their clients"
  on public.client_tasks for select
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_tasks.client_id
      and clients.created_by = auth.uid()
    )
  );

create policy "Users can insert tasks for their clients"
  on public.client_tasks for insert
  with check (
    exists (
      select 1 from public.clients
      where clients.id = client_tasks.client_id
      and clients.created_by = auth.uid()
    )
  );

create policy "Users can update tasks for their clients"
  on public.client_tasks for update
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_tasks.client_id
      and clients.created_by = auth.uid()
    )
  );

create policy "Users can delete tasks for their clients"
  on public.client_tasks for delete
  using (
    exists (
      select 1 from public.clients
      where clients.id = client_tasks.client_id
      and clients.created_by = auth.uid()
    )
  );
