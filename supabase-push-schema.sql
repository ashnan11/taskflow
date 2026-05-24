create table if not exists public.taskflow_push_subscriptions (
  endpoint text primary key,
  user_id uuid null references auth.users(id) on delete cascade,
  subscription jsonb not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists taskflow_push_subscriptions_user_id_idx
  on public.taskflow_push_subscriptions(user_id);

create table if not exists public.taskflow_sent_reminders (
  reminder_key text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null,
  reminder_at timestamptz not null,
  sent_at timestamptz not null default now()
);

create index if not exists taskflow_sent_reminders_user_id_idx
  on public.taskflow_sent_reminders(user_id);

alter table public.taskflow_push_subscriptions enable row level security;
alter table public.taskflow_sent_reminders enable row level security;

create policy "Users can view their own push subscriptions"
  on public.taskflow_push_subscriptions
  for select
  using (auth.uid() = user_id);

create policy "Users can delete their own push subscriptions"
  on public.taskflow_push_subscriptions
  for delete
  using (auth.uid() = user_id);

create policy "Users can view their own sent reminders"
  on public.taskflow_sent_reminders
  for select
  using (auth.uid() = user_id);
