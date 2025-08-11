-- Enable pgcrypto for gen_random_uuid() if needed
create extension if not exists "pgcrypto";

-- Clients
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  status text not null check (status in ('active','inactive','prospect','lead','vip')),
  last_contact timestamptz not null,
  tags jsonb not null default '[]',
  notes text,
  interactions jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  client_id uuid not null references public.clients(id) on delete cascade,
  due_date timestamptz not null,
  type text not null check (type in ('call','email','meeting','follow-up')),
  priority text not null check (priority in ('low','medium','high')),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  product text not null,
  description text,
  amount numeric not null,
  date timestamptz not null,
  status text not null check (status in ('pending','processing','completed','cancelled')),
  created_at timestamptz not null default now()
);

-- For quick dev: (OPTIONAL) disable RLS, or add permissive policies if you keep RLS on
-- alter table public.clients disable row level security;
-- alter table public.tasks disable row level security;
-- alter table public.orders disable row level security;
