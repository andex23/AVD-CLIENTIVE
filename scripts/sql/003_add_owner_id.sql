-- Add owner_id columns to scope data per user (optional but recommended)
-- Run this in Supabase SQL editor

-- Clients
alter table if exists public.clients add column if not exists owner_id uuid;
create index if not exists idx_clients_owner on public.clients(owner_id);

-- Tasks
alter table if exists public.tasks add column if not exists owner_id uuid;
create index if not exists idx_tasks_owner on public.tasks(owner_id);

-- Orders
alter table if exists public.orders add column if not exists owner_id uuid;
create index if not exists idx_orders_owner on public.orders(owner_id);


