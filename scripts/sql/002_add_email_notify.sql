-- Add email_notify flag to tasks for per-task email reminders
alter table if exists public.tasks
add column if not exists email_notify boolean not null default false;
