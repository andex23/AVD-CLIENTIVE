-- Optional: enable RLS and add owner-based policies on data tables
-- Requires owner_id columns (see 003_add_owner_id.sql)

alter table if exists public.clients enable row level security;
alter table if exists public.tasks enable row level security;
alter table if exists public.orders enable row level security;

-- Read own rows
create policy if not exists "Clients select own" on public.clients
  for select using (owner_id = auth.uid());
create policy if not exists "Tasks select own" on public.tasks
  for select using (owner_id = auth.uid());
create policy if not exists "Orders select own" on public.orders
  for select using (owner_id = auth.uid());

-- Insert only as self owner
create policy if not exists "Clients insert own" on public.clients
  for insert with check (owner_id = auth.uid());
create policy if not exists "Tasks insert own" on public.tasks
  for insert with check (owner_id = auth.uid());
create policy if not exists "Orders insert own" on public.orders
  for insert with check (owner_id = auth.uid());

-- Update/Delete own rows
create policy if not exists "Clients modify own" on public.clients
  for update using (owner_id = auth.uid());
create policy if not exists "Tasks modify own" on public.tasks
  for update using (owner_id = auth.uid());
create policy if not exists "Orders modify own" on public.orders
  for update using (owner_id = auth.uid());

create policy if not exists "Clients delete own" on public.clients
  for delete using (owner_id = auth.uid());
create policy if not exists "Tasks delete own" on public.tasks
  for delete using (owner_id = auth.uid());
create policy if not exists "Orders delete own" on public.orders
  for delete using (owner_id = auth.uid());


