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

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (`http://localhost:5173/`).

## Deploy

This is a standard Vite app — push it to a GitHub repo and import it on
[Vercel](https://vercel.com/new). Build command `npm run build`, output
directory `dist`. No env vars needed.

## Data storage

Data is saved to the browser's `localStorage` (see the `storage` adapter
in `src/lib/storage.js`), so it persists per-browser/per-device with no
backend. If you later want it to sync across devices, swap that adapter
for calls to a real backend (or something like Supabase).

## Project structure

The app used to be a single ~1800-line file. It's now split by concern:

```
src/
  HabitSheet.jsx          # main container: state, effects, handlers, habits-page layout
  theme.js                # design tokens (colors) + default seed data
  lib/
    storage.js             # localStorage adapter
    dateHelpers.js          # date math (toDateStr, buildWeeks, etc.)
    format.js               # fmtMoney, textOn
  components/
    common/                 # StatCard, TrendChart, Donut, CategoryEditRow
    habits/                 # HabitModal
    tasks/                  # TaskTrackerView + its modal/panel/section pieces
    finance/                # FinanceTrackerView + its modal/panel/section pieces
```

Each `TaskTrackerView` / `FinanceTrackerView` is a self-contained "page"
that receives state and callbacks as props from `HabitSheet.jsx` — same
pattern the habits page itself follows inline. If the habits page grows,
it's a natural next step to pull it out into `components/habits/HabitsView.jsx`
the same way.

