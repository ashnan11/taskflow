-- Run in Supabase SQL editor for cloud sync
create table if not exists public.taskflow_user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.taskflow_user_data enable row level security;

create policy "Users can read own data"
  on public.taskflow_user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own data"
  on public.taskflow_user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own data"
  on public.taskflow_user_data for update
  using (auth.uid() = user_id);

-- Enable realtime (optional)
alter publication supabase_realtime add table public.taskflow_user_data;
