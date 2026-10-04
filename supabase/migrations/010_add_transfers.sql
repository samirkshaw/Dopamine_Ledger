-- Dopamine Ledger — Migration 010
-- Add 'transfer' transaction type and 'to_account' destination column for moving money between accounts.
-- Run once in the Supabase SQL Editor (Project → SQL Editor → New query).

alter table transactions drop constraint if exists transactions_type_check;
alter table transactions add constraint transactions_type_check check (type in ('income', 'expense', 'transfer'));

alter table transactions add column if not exists to_account text check (to_account in ('bank', 'cash'));
