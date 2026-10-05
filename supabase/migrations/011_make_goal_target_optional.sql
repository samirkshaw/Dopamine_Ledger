-- Dopamine Ledger — Migration 011
-- Makes target_count optional on the goals table so a goal can be created
-- with just a title (no numeric target). Goals without a target display as
-- a plain running count and are excluded from the blended completion rate.

-- 1. Drop the NOT NULL + CHECK constraint on target_count.
ALTER TABLE goals ALTER COLUMN target_count DROP NOT NULL;
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_target_count_check;
-- Re-add the check so it still validates when a value IS provided.
ALTER TABLE goals ADD CONSTRAINT goals_target_count_check CHECK (target_count IS NULL OR target_count > 0);
