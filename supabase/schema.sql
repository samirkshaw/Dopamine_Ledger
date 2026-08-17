-- Dopamine Ledger — Supabase schema (v2: full relational + real auth)
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
-- Replaces the earlier single app_data table.

drop table if exists app_data;

-- ---------- Habits ----------
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  icon text not null default '🎯',
  sort_order int not null default 0,
  created_at timestamptz default now(),
  unique (user_id, name)  -- migration 001
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  habit_id uuid references habits(id) on delete cascade not null,
  log_date date not null,
  created_at timestamptz default now(),
  unique (habit_id, log_date)
);

-- ---------- Tasks ----------
create table task_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  created_at timestamptz default now(),
  unique (user_id, name)  -- migration 001
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category_id uuid references task_categories(id) on delete set null,
  title text not null,
  priority text not null default 'med' check (priority in ('low','med','high')),
  due_date date,
  planned_date date,           -- migration 002: the day I plan to work on this
  notes text,
  done boolean not null default false,
  done_at date,
  created_at timestamptz default now()
);

-- ---------- Finance ----------
create table finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  kind text not null check (kind in ('income','expense')),
  created_at timestamptz default now(),
  unique (user_id, name)  -- migration 001
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category_id uuid references finance_categories(id) on delete set null,
  account text not null default 'bank',
  type text not null check (type in ('income','expense')),
  amount numeric not null check (amount > 0),
  note text,
  txn_date date not null default current_date,
  created_at timestamptz default now()
);

-- ---------- Row Level Security ----------
-- Every table: a user can only ever see/write/delete their own rows.
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table task_categories enable row level security;
alter table tasks enable row level security;
alter table finance_categories enable row level security;
alter table transactions enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['habits','habit_logs','task_categories','tasks','finance_categories','transactions']
  loop
    execute format('create policy "select own" on %I for select using (auth.uid() = user_id)', t);
    execute format('create policy "insert own" on %I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "update own" on %I for update using (auth.uid() = user_id)', t);
    execute format('create policy "delete own" on %I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ---------- Indexes ----------
create index habit_logs_user_date_idx on habit_logs (user_id, log_date);
create index tasks_user_done_idx on tasks (user_id, done);
create index tasks_user_planned_idx on tasks (user_id, planned_date);  -- migration 002
create index transactions_user_date_idx on transactions (user_id, txn_date);

-- No anonymous auth needed here — this version uses real email/password
-- sign-up via Supabase Auth. No dashboard toggles required beyond the
-- defaults (email auth is on by default in every new Supabase project).
