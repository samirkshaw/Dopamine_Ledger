-- Dopamine Ledger — Migration 007
-- Adds source_note_id to tasks to link tasks created from notes.
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query),
-- after 006_add_notes.sql has been applied.

alter table tasks add column source_note_id uuid references notes(id) on delete set null;
