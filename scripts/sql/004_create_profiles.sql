-- Profiles (app users) table linked to Supabase auth.users
-- Run this once in Supabase SQL editor

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Only allow a user to read/update their own profile
create policy if not exists "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy if not exists "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Auto-insert profile on auth signup (copies full_name from user metadata if present)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


