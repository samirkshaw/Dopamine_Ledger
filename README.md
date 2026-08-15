# Dopamine Ledger

A dark-themed, single-page life dashboard — track daily habits with a
streak-aware monthly grid, manage tasks by category and priority, and
log income/expenses across accounts. No backend, no sign-up: everything
lives in your browser via `localStorage`.

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

React 18 + Vite, [lucide-react](https://lucide.dev/) icons, no CSS framework — all inline styles driven by a shared design-token file (`src/theme.js`). No backend: data is persisted to `localStorage` (see [Data storage](#data-storage)).


Each `TaskTrackerView` / `FinanceTrackerView` is a self-contained "page"
that receives state and callbacks as props from `HabitSheet.jsx` — same
pattern the habits page itself follows inline. If the habits page grows,
it's a natural next step to pull it out into `components/habits/HabitsView.jsx`
the same way.

