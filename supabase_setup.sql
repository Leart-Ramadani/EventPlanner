-- Run this in your Supabase dashboard → SQL Editor

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  project_name text not null default 'Untitled Event',
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Only the owner can read/write their project
alter table projects enable row level security;

create policy "Users can manage their own project"
  on projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
