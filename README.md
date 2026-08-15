# Dopamine Ledger

Habit tracker + task manager + finance tracker, in one React component.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

This is a standard Vite app — push it to a GitHub repo and import it on
[Vercel](https://vercel.com/new). Build command `npm run build`, output
directory `dist`. No env vars needed.

## Data storage

Data is saved to the browser's `localStorage` (see the `storage` adapter
at the top of `src/HabitSheet.jsx`), so it persists per-browser/per-device
with no backend. If you later want it to sync across devices, swap that
adapter for calls to a real backend (or something like Supabase).

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

## Rename checklist (when you've picked the final name)

- [x] `package.json` → `name` (`dopamine-ledger`)
- [x] `index.html` → `<title>` (`Dopamine Ledger`)
- [ ] GitHub repo name
- [ ] Vercel project name / domain
