-- HR Work Tracker · Alfalah Investments
-- Initial schema: profiles, work categories, work logs, notifications

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  job_title text not null default 'HR Professional',
  department text not null default 'Human Resources',
  avatar_url text,
  timezone text not null default 'UTC',
  daily_goal_minutes integer not null default 480,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- work_categories
-- ─────────────────────────────────────────────────────────────
create table if not exists public.work_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#3B82F6',
  icon text not null default 'briefcase',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.work_categories enable row level security;

create policy "Categories are viewable by owner or default"
  on public.work_categories for select
  using (is_default = true or auth.uid() = user_id);

create policy "Categories are insertable by owner"
  on public.work_categories for insert
  with check (auth.uid() = user_id);

create policy "Categories are editable by owner"
  on public.work_categories for update
  using (auth.uid() = user_id);

create policy "Categories are deletable by owner"
  on public.work_categories for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- work_logs
-- ─────────────────────────────────────────────────────────────
create table if not exists public.work_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.work_categories (id) on delete set null,
  title text not null,
  description text not null default '',
  status text not null default 'completed' check (status in ('completed', 'in_progress')),
  work_date date not null default current_date,
  start_time timestamptz not null default now(),
  end_time timestamptz,
  duration_minutes integer not null default 0,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.work_logs enable row level security;

create index if not exists work_logs_user_date_idx on public.work_logs (user_id, work_date);
create index if not exists work_logs_user_status_idx on public.work_logs (user_id, status);

create policy "Work logs are viewable by owner"
  on public.work_logs for select
  using (auth.uid() = user_id);

create policy "Work logs are insertable by owner"
  on public.work_logs for insert
  with check (auth.uid() = user_id);

create policy "Work logs are editable by owner"
  on public.work_logs for update
  using (auth.uid() = user_id);

create policy "Work logs are deletable by owner"
  on public.work_logs for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- notifications
-- ─────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  message text not null default '',
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'insight')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create index if not exists notifications_user_read_idx on public.notifications (user_id, read);

create policy "Notifications are viewable by owner"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Notifications are insertable by owner"
  on public.notifications for insert
  with check (auth.uid() = user_id);

create policy "Notifications are editable by owner"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Notifications are deletable by owner"
  on public.notifications for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- default categories (global, visible to everyone)
-- ─────────────────────────────────────────────────────────────
insert into public.work_categories (name, color, icon, is_default) values
  ('Recruitment', '#3B82F6', 'user-search', true),
  ('Onboarding', '#22A559', 'user-plus', true),
  ('Employee Relations', '#C98500', 'handshake', true),
  ('Payroll & Benefits', '#9085E9', 'wallet', true),
  ('Training & Development', '#D55181', 'graduation-cap', true),
  ('Performance Management', '#199E70', 'target', true),
  ('Compliance', '#E66767', 'shield-check', true),
  ('Administration', '#71717A', 'file-text', true),
  ('Meetings', '#D95926', 'users', true)
on conflict do nothing;

-- updated_at helper trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_work_logs_updated_at on public.work_logs;
create trigger set_work_logs_updated_at
  before update on public.work_logs
  for each row execute procedure public.set_updated_at();
