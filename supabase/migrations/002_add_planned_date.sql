-- Dopamine Ledger — Migration 002
-- Adds planned_date to the tasks table so tasks can be scheduled for a
-- specific calendar day without conflicting with due_date (which tracks
-- the hard deadline). Also creates a supporting index for the Today tab
-- queries (filter by user_id + planned_date).
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query),
-- after 001_add_uniqueness_constraints.sql has been applied.

alter table tasks add column planned_date date;

create index tasks_user_planned_idx on tasks (user_id, planned_date);
