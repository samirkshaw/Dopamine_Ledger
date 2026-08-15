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

## Backend & auth

Real backend now — Supabase, with six relational tables (`habits`,
`habit_logs`, `task_categories`, `tasks`, `finance_categories`,
`transactions`), row-level security scoping every row to its owner, and
email/password sign-up via Supabase Auth. No more `localStorage`.

**One-time setup:**

1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → paste and run `supabase/schema.sql`
3. Project Settings → API → copy the Project URL and anon public key
4. `cp .env.example .env` and fill in those two values
5. `npm install && npm run dev`

First sign-up seeds your starter habits/categories automatically (once,
server-side) — same defaults the app always shipped with.

The anon key is safe to ship in the client bundle by design — it's RLS,
not secrecy, that protects your data. Never put the Supabase **service
role** key anywhere in this codebase.

## Data model

```
src/lib/
  supabaseClient.js   # the Supabase client singleton
  auth.js             # signUp / signIn / signOut / session helpers
  db/
    habits.js          # habits + habit_logs CRUD
    tasks.js            # tasks + task_categories CRUD
    finance.js           # transactions + finance_categories CRUD
```

Each `HabitSheet.jsx` handler (`addTask`, `toggle`, `deleteHabit`, etc.)
calls into these `db/*` functions, which return already in the shape the
UI expects — so `theme.js`, `dateHelpers.js`, and every component below
`HabitSheet.jsx` didn't need to change at all when the backend did.

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

## Roadmap

- [x] Real backend with row-level security
- [x] Auth (email/password)
- [ ] Deploy to Vercel — remember to set `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` as env vars in the Vercel project settings, not just locally
- [ ] Password reset flow (Supabase Auth supports it; UI not built here yet)
- [ ] Extract the habits page into its own `components/habits/HabitsView.jsx`, matching the tasks/finance pattern, once it grows

## License

MIT — do whatever you want with it.
