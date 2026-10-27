-- Run once in Supabase > SQL Editor > New query > Run

-- Public artist profiles (no email here: profiles are visible to everyone)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  handle text unique not null,
  roles text[] default '{}',
  level text,
  genres text[] default '{}',
  collab boolean default true,
  avatar_url text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Create own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Edit own profile" on public.profiles for update using (auth.uid() = id);

-- Saved tracks, private to their owner
create table if not exists public.projects (
  id text primary key,
  owner uuid not null references auth.users on delete cascade,
  title text,
  data jsonb,
  updated_at timestamptz default now()
);
alter table public.projects enable row level security;
create policy "Own projects only" on public.projects for all using (auth.uid() = owner) with check (auth.uid() = owner);

-- The drop list: emails and consent. Only you can read it (in the Supabase dashboard).
create table if not exists public.waitlist (
  user_id uuid primary key references auth.users on delete cascade,
  email text,
  name text,
  opt_in boolean default false,
  updated_at timestamptz default now()
);
alter table public.waitlist enable row level security;
create policy "Add own entry" on public.waitlist for insert with check (auth.uid() = user_id);
create policy "Update own entry" on public.waitlist for update using (auth.uid() = user_id);

-- Usage events and feedback: anyone can add, only you can read
create table if not exists public.events (
  id bigint generated always as identity primary key,
  event text not null,
  props jsonb default '{}',
  anon_id text,
  user_id uuid,
  project_id text,
  created_at timestamptz default now()
);
alter table public.events enable row level security;
create policy "Anyone can log events" on public.events for insert with check (user_id is null or auth.uid() = user_id);

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  mood text,
  text text,
  view text,
  anon_id text,
  user_id uuid,
  project_id text,
  created_at timestamptz default now()
);
alter table public.feedback enable row level security;
create policy "Anyone can send feedback" on public.feedback for insert with check (user_id is null or auth.uid() = user_id);

-- Handy views for your pitch numbers (open them in the Table Editor)
create or replace view public.tester_funnel with (security_invoker = true) as
select event, count(*) as times, count(distinct coalesce(user_id::text, anon_id)) as people
from public.events group by event order by people desc;
