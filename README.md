# Dopamine Ledger

A dark-themed, single-page life dashboard — track daily habits with a
streak-aware monthly grid, manage tasks by category and priority, and
log income/expenses across accounts. Backed by Supabase: real accounts,
real per-user data, nothing lost on a cleared browser cache.

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

React 18 + Vite, [Supabase](https://supabase.com) (Postgres + Auth), [lucide-react](https://lucide.dev/) icons, no CSS framework — all inline styles driven by a shared design-token file (`src/theme.js`).


## Project structure

The app used to be a single ~1800-line file. It's now split by concern:

```
src/
  HabitSheet.jsx          # main container: state, effects, handlers, habits-page layout
  main.jsx                 # auth gate: shows Login or HabitSheet based on session
  theme.js                # design tokens (colors) + default seed data
  lib/
    supabaseClient.js       # Supabase client singleton
    auth.js                  # signUp / signIn / signOut / session helpers
    dateHelpers.js            # date math (toDateStr, buildWeeks, etc.)
    format.js                  # fmtMoney, textOn
    db/
      habits.js                 # habits + habit_logs CRUD — see supabase/README.md
      tasks.js                   # tasks + task_categories CRUD
      finance.js                  # transactions + finance_categories CRUD
  components/
    common/                 # StatCard, TrendChart, Donut, CategoryEditRow
    auth/                    # Login
    habits/                   # HabitModal
    tasks/                     # TaskTrackerView + its modal/panel/section pieces
    finance/                    # FinanceTrackerView + its modal/panel/section pieces
```

Each `HabitSheet.jsx` handler (`addTask`, `toggle`, `deleteHabit`, etc.)
calls into a `db/*` function, which returns data already shaped the way
the UI expects — so `theme.js`, `dateHelpers.js`, and every component
below `HabitSheet.jsx` didn't need to change at all when the backend
went from `localStorage` to Supabase.

Each `TaskTrackerView` / `FinanceTrackerView` is a self-contained "page"
that receives state and callbacks as props from `HabitSheet.jsx` — same
pattern the habits page itself follows inline. If the habits page grows,
it's a natural next step to pull it out into `components/habits/HabitsView.jsx`
the same way.

## Roadmap

- [x] Real backend with row-level security
- [x] Auth (email/password)
- [x] Deployed to Vercel
- [ ] Password reset flow (Supabase Auth supports it; UI not built here yet)
- [ ] Extract the habits page into its own `components/habits/HabitsView.jsx`, matching the tasks/finance pattern, once it grows
- [ ] `supabase/migrations/` for future schema changes instead of editing `schema.sql` in place (see supabase/README.md)

## License

MIT — do whatever you want with it.
