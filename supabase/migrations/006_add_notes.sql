-- Dopamine Ledger — Migration 006
-- Adds notes and note_categories tables for Quick Notes and Notebook.
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query),
-- after 005_add_goals_and_scheduling.sql has been applied.

create table note_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  created_at timestamptz default now()
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  category_id uuid references note_categories(id) on delete set null,
  note_type text not null default 'note' check (note_type in ('note','quick')),
  title text,
  content text not null default '',
  pinned boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table note_categories enable row level security;
alter table notes enable row level security;

create policy "select own" on note_categories for select using (auth.uid() = user_id);
create policy "insert own" on note_categories for insert with check (auth.uid() = user_id);
create policy "update own" on note_categories for update using (auth.uid() = user_id);
create policy "delete own" on note_categories for delete using (auth.uid() = user_id);

create policy "select own" on notes for select using (auth.uid() = user_id);
create policy "insert own" on notes for insert with check (auth.uid() = user_id);
create policy "update own" on notes for update using (auth.uid() = user_id);
create policy "delete own" on notes for delete using (auth.uid() = user_id);

create index notes_user_type_idx on notes (user_id, note_type);
create index notes_user_category_idx on notes (user_id, category_id);

-- Reuse the same updated_at-bumping trigger pattern from the base
-- schema (create or replace makes this safe even if it already exists).
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger notes_updated_at
  before update on notes
  for each row execute function set_updated_at();
