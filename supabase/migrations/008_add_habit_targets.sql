-- Migration 008: Add habit targets and log amounts for quantified habits
alter table habits add column target_amount numeric check (target_amount > 0);
alter table habits add column unit text;
alter table habit_logs add column amount numeric not null default 1 check (amount > 0);
