# Dopamine Ledger

A dark-themed, life dashboard — track daily habits with a
streak-aware monthly grid, manage tasks by category and priority, and
log income/expenses across accounts.

Deployed Link : [Dopamine Ledger](https://dopamine-ledger.vercel.app/)

Built as a personal productivity tool, part of the [HQ Dopamine](https://github.com/samirkshaw) build-in-public series.

## Features

**Habits**
- Monthly calendar grid, one row per habit, click a day to toggle it done
- Current streaks, weekly/monthly completion stats, and a trend chart
- Add/edit/delete habits with custom emoji icons

**Tasks**
- Custom categories (color-coded), priority levels, due dates
- Pending / overdue / due-this-week / completed breakdown with completion rate
- Inline quick-add, full edit modal for details

**Finance**
- Multiple accounts, income vs. expense categories
- Monthly trend chart across the last 6 months
- Inline quick-add for transactions, full edit modal for details

## Tech stack

React 18 + Vite, [lucide-react](https://lucide.dev/) icons, no CSS framework — all inline styles driven by a shared design-token file (`src/theme.js`).Backend :Superbase , Deployment : Vercel
```

## Backend & auth

Real backend now — Supabase, with six relational tables (`habits`,
`habit_logs`, `task_categories`, `tasks`, `finance_categories`,
`transactions`), row-level security scoping every row to its owner, and
email/password sign-up via Supabase Auth. No more.


Each `HabitSheet.jsx` handler (`addTask`, `toggle`, `deleteHabit`, etc.)
calls into these `db/*` functions, which return already in the shape the
UI expects — so `theme.js`, `dateHelpers.js`, and every component below
`HabitSheet.jsx` didn't need to change at all when the backend did.

