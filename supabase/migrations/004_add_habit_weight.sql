-- Dopamine Ledger — Migration 004
-- Adds a per-habit weight so aggregate progress metrics (Today / Week /
-- Month percentages) can reflect that some habits matter more than
-- others.  Default 1 — existing habits behave exactly as before.
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query),
-- after 003_add_task_source.sql has been applied.

alter table habits add column weight numeric not null default 1 check (weight > 0);
