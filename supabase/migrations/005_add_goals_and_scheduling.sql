-- Dopamine Ledger — Migration 005
-- Adds weekly goals table and goal-linking / scheduling columns on tasks.
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query),
-- after 004_add_habit_weight.sql has been applied.

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  target_count numeric not null check (target_count > 0),
  unit text not null default '',
  week_start date not null,
  created_at timestamptz default now()
);

alter table goals enable row level security;
create policy "select own" on goals for select using (auth.uid() = user_id);
create policy "insert own" on goals for insert with check (auth.uid() = user_id);
create policy "update own" on goals for update using (auth.uid() = user_id);
create policy "delete own" on goals for delete using (auth.uid() = user_id);
create index goals_user_week_idx on goals (user_id, week_start);

alter table tasks add column goal_id uuid references goals(id) on delete set null;
alter table tasks add column goal_contribution numeric not null default 1 check (goal_contribution > 0);
alter table tasks add column scheduled_time time;
