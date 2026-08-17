-- Dopamine Ledger — Migration 001
-- Adds per-user uniqueness constraints on name columns for the three
-- seed-able tables. Data was already de-duplicated manually via the app
-- UI; these constraints simply make the guard permanent at the DB level.
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query).

alter table habits
  add constraint habits_user_name_uniq unique (user_id, name);

alter table task_categories
  add constraint task_categories_user_name_uniq unique (user_id, name);

alter table finance_categories
  add constraint finance_categories_user_name_uniq unique (user_id, name);
