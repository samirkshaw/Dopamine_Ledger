-- Dopamine Ledger — Migration 003
-- Adds a source column to tasks so the Tasks backlog can distinguish
-- full tracked tasks from lightweight quick-add items created via the
-- Today tab. Quick-add items (source = 'quick') never appear in the
-- Tasks tab; they're disposable daily chores. Full tasks
-- (source = 'task') behave exactly as before.
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query),
-- after 002_add_planned_date.sql has been applied.

alter table tasks add column source text not null default 'task' check (source in ('task','quick'));
