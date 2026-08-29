import { useState, useEffect, useMemo, forwardRef } from 'react';
import { Check, Plus, ChevronLeft, ChevronRight, Flame, ListChecks, Loader2, Pencil, Wallet, LogOut, Sun, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { toDateStr, todayStr, addDaysStr, monthLabel, buildWeeks, DOW, mondayOf } from './lib/dateHelpers.js';
import { C, WEEK_COLORS, FONT_IMPORT, DEFAULT_HABITS, DEFAULT_CATEGORIES, DEFAULT_FINANCE_CATEGORIES } from './theme.js';
import { signOut } from './lib/auth.js';
import * as habitsDb from './lib/db/habits.js';
import * as tasksDb from './lib/db/tasks.js';
import * as financeDb from './lib/db/finance.js';
import * as goalsDb from './lib/db/goals.js';

import StatCard from './components/common/StatCard.jsx';
import TrendChart from './components/common/TrendChart.jsx';
import Donut from './components/common/Donut.jsx';
import HabitModal from './components/habits/HabitModal.jsx';
import TaskTrackerView from './components/tasks/TaskTrackerView.jsx';
import TaskModal from './components/tasks/TaskModal.jsx';
import CategoryPanel from './components/tasks/CategoryPanel.jsx';
import TodayView from './components/todo/TodayView.jsx';
import FinanceTrackerView from './components/finance/FinanceTrackerView.jsx';
import TransactionModal from './components/finance/TransactionModal.jsx';
import FinanceCategoryPanel from './components/finance/FinanceCategoryPanel.jsx';

function SortableHabitRow({ habit, hitsThisMonth, goalPerHabit, weeks, today, isDone, toggle, setEditHabit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'flex', alignItems: 'center', borderTop: `1px solid ${C.line}`,
  };
  const h = habit;
  return (
    <div ref={setNodeRef} style={style} className="hs-row">
      <div className="hs-grid-sticky-col" style={{ width: 220, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 6px 7px 4px', background: '#15111E' }}>
        <button {...attributes} {...listeners} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'grab', padding: '0 2px', flexShrink: 0, display: 'flex', alignItems: 'center', touchAction: 'none' }}>
          <GripVertical size={13} />
        </button>
        <span style={{ fontSize: 15 }}>{h.icon}</span>
        <span style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</span>
        <button onClick={() => setEditHabit(h)} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}><Pencil size={11} /></button>
      </div>
      <div style={{ width: 50, flexShrink: 0, textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: C.sub }}>
        {hitsThisMonth}/{goalPerHabit}
      </div>
      {weeks.map((w, wi) => {
        const col = WEEK_COLORS[wi % WEEK_COLORS.length];
        return (
          <div key={wi} style={{ display: 'flex', width: 210, flexShrink: 0 }}>
            {w.map((d, di) => {
              if (!d) return <div key={di} style={{ flex: 1, padding: '5px 0', background: 'rgba(255,255,255,0.02)' }} />;
              const done = isDone(h.id, d);
              const future = d > today;
              const isToday = d === today;
              return (
                <div key={di} style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '5px 0', background: isToday ? '#F5A62333' : col.bg + '55' }}>
                  <div className={future ? '' : 'hs-cell'} onClick={() => !future && toggle(h.id, d)} style={{
                    width: 17, height: 17, borderRadius: 4,
                    background: done ? C.tealDark : 'rgba(255,255,255,0.08)',
                    border: `${isToday ? 2 : 1.4}px solid ${done ? C.tealDark : isToday ? C.warn : 'rgba(255,255,255,0.25)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: future ? 0.35 : 1,
                  }}>
                    {done && <Check size={11} color="#fff" strokeWidth={3.2} />}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function HabitSheet() {
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [financeCategories, setFinanceCategories] = useState([]);
  const [page, setPage] = useState('habits'); // 'habits' | 'tasks' | 'today' | 'finance'
  const [goals, setGoals] = useState([]);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [showAdd, setShowAdd] = useState(false);
  const [editHabit, setEditHabit] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [showCatPanel, setShowCatPanel] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [taskSort, setTaskSort] = useState('deadline');
  const [editTxn, setEditTxn] = useState(null);
  const [showFinCatPanel, setShowFinCatPanel] = useState(false);
  const [finFilterCat, setFinFilterCat] = useState('all');
  const [finTypeFilter, setFinTypeFilter] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        let [h, cats, finCats] = await Promise.all([
          habitsDb.listHabits(),
          tasksDb.listTaskCategories(),
          financeDb.listFinanceCategories(),
        ]);
        // First time this user has ever logged in: seed the starter data
        // once, server-side, so it's real rows from the start.
        if (h.length === 0) h = await habitsDb.seedDefaultHabits(DEFAULT_HABITS);
        if (cats.length === 0) cats = await tasksDb.seedDefaultTaskCategories(DEFAULT_CATEGORIES);
        if (finCats.length === 0) finCats = await financeDb.seedDefaultFinanceCategories(DEFAULT_FINANCE_CATEGORIES);

        const [l, t, txns] = await Promise.all([
          habitsDb.listLogs(),
          tasksDb.listTasks(),
          financeDb.listTransactions(),
        ]);
        const g = await goalsDb.listGoalsForWeek(mondayOf(todayStr()));
        setHabits(h); setLogs(l); setTasks(t); setCategories(cats); setTransactions(txns); setFinanceCategories(finCats); setGoals(g);
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2000); };
  const showError = (e) => { console.error(e); showToast(e?.message || 'Something went wrong'); };

  function addTask(task) {
    tasksDb.createTaskRow(task)
      .then(row => { setTasks(prev => [row, ...prev]); showToast('Task added'); })
      .catch(showError);
  }
  function updateTask(task) {
    tasksDb.updateTaskRow(task.id, task)
      .then(() => { setTasks(prev => prev.map(x => x.id === task.id ? { ...x, ...task } : x)); setEditTask(null); showToast('Task updated'); })
      .catch(showError);
  }

  function addGoal(goal) {
    const weekStart = mondayOf(todayStr());
    goalsDb.createGoal({ ...goal, weekStart })
      .then(row => { setGoals(prev => [...prev, row]); showToast('Goal added'); })
      .catch(showError);
  }
  function updateGoal(goal) {
    goalsDb.updateGoalRow(goal.id, goal)
      .then(() => { setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ...goal } : g)); showToast('Goal updated'); })
      .catch(showError);
  }
  function deleteGoal(id) {
    goalsDb.deleteGoalRow(id)
      .then(() => {
        setGoals(prev => prev.filter(g => g.id !== id));
        setTasks(prev => prev.map(t => t.goalId === id ? { ...t, goalId: null } : t));
        showToast('Goal removed');
      })
      .catch(showError);
  }
  function deleteTask(id) {
    tasksDb.deleteTaskRow(id)
      .then(() => { setTasks(prev => prev.filter(x => x.id !== id)); setEditTask(null); showToast('Task removed'); })
      .catch(showError);
  }
  function toggleTaskDone(id) {
    const task = tasks.find(x => x.id === id);
    if (!task) return;
    const done = !task.done;
    const doneAt = done ? todayStr() : null;
    tasksDb.setTaskDone(id, done, doneAt)
      .then(() => setTasks(prev => prev.map(x => x.id === id ? { ...x, done, doneAt } : x)))
      .catch(showError);
  }
  function setTaskPlannedDate(id, date) {
    tasksDb.setPlannedDate(id, date)
      .then(() => setTasks(prev => prev.map(t => t.id === id ? { ...t, plannedDate: date } : t)))
      .catch(showError);
  }
  function clearCompletedTasks() {
    if (!tasks.some(t => t.done)) return;
    tasksDb.clearCompletedTaskRows()
      .then(() => { setTasks(prev => prev.filter(t => !t.done)); showToast('Completed tasks cleared'); })
      .catch(showError);
  }
  function addCategory(cat) {
    tasksDb.createTaskCategory(cat)
      .then(row => { setCategories(prev => [...prev, row]); showToast('Category added'); })
      .catch(showError);
  }
  function editCategory(id, updates) {
    tasksDb.updateTaskCategoryRow(id, updates)
      .then(() => { setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)); showToast('Category updated'); })
      .catch(showError);
  }
  function deleteCategory(id) {
    if (categories.length <= 1) return;
    tasksDb.deleteTaskCategoryRow(id)
      .then(() => {
        setCategories(prev => prev.filter(c => c.id !== id));
        setTasks(prev => prev.map(t => t.category === id ? { ...t, category: null } : t));
        if (filterCat === id) setFilterCat('all');
        showToast('Category removed');
      })
      .catch(showError);
  }

  function addTransaction(txn) {
    financeDb.createTransactionRow(txn)
      .then(row => { setTransactions(prev => [row, ...prev]); showToast(txn.type === 'income' ? 'Income added' : 'Expense added'); })
      .catch(showError);
  }
  function updateTransaction(txn) {
    financeDb.updateTransactionRow(txn.id, txn)
      .then(() => { setTransactions(prev => prev.map(x => x.id === txn.id ? { ...x, ...txn } : x)); setEditTxn(null); showToast('Transaction updated'); })
      .catch(showError);
  }
  function deleteTransaction(id) {
    financeDb.deleteTransactionRow(id)
      .then(() => { setTransactions(prev => prev.filter(x => x.id !== id)); setEditTxn(null); showToast('Transaction removed'); })
      .catch(showError);
  }
  function addFinanceCategory(cat) {
    financeDb.createFinanceCategory(cat)
      .then(row => { setFinanceCategories(prev => [...prev, row]); showToast('Category added'); })
      .catch(showError);
  }
  function editFinanceCategory(id, updates) {
    financeDb.updateFinanceCategoryRow(id, updates)
      .then(() => { setFinanceCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c)); showToast('Category updated'); })
      .catch(showError);
  }
  function deleteFinanceCategory(id) {
    if (financeCategories.length <= 1) return;
    financeDb.deleteFinanceCategoryRow(id)
      .then(() => {
        setFinanceCategories(prev => prev.filter(c => c.id !== id));
        setTransactions(prev => prev.map(t => t.category === id ? { ...t, category: null } : t));
        if (finFilterCat === id) setFinFilterCat('all');
        showToast('Category removed');
      })
      .catch(showError);
  }

  function toggle(habitId, dateStr) {
    if (dateStr > todayStr()) return;
    const wasDone = !!(logs[dateStr] || {})[habitId];
    const next = { ...logs, [dateStr]: { ...(logs[dateStr] || {}) } };
    next[dateStr][habitId] = !wasDone;
    setLogs(next); // optimistic — feels instant on every tap
    habitsDb.setLogDone(habitId, dateStr, !wasDone).catch(e => {
      setLogs(logs); // roll back on failure
      showError(e);
    });
  }
  function isDone(habitId, dateStr) { return !!(logs[dateStr] || {})[habitId]; }

  function addHabit(h) {
    habitsDb.createHabit(h)
      .then(row => { setHabits(prev => [...prev, row]); setShowAdd(false); showToast('Habit added'); })
      .catch(showError);
  }
  function updateHabit(h) {
    habitsDb.updateHabitRow(h.id, h)
      .then(() => { setHabits(prev => prev.map(x => x.id === h.id ? { ...x, ...h } : x)); setEditHabit(null); showToast('Habit updated'); })
      .catch(showError);
  }
  function deleteHabit(id) {
    habitsDb.deleteHabitRow(id)
      .then(() => { setHabits(prev => prev.filter(x => x.id !== id)); setEditHabit(null); showToast('Habit removed'); })
      .catch(showError);
  }
  function reorderHabitsList(newHabits) {
    const prev = habits;
    setHabits(newHabits);
    habitsDb.reorderHabits(newHabits.map(h => h.id)).catch(e => {
      setHabits(prev);
      showError(e);
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = habits.findIndex(h => h.id === active.id);
    const newIdx = habits.findIndex(h => h.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reordered = arrayMove(habits, oldIdx, newIdx);
    reorderHabitsList(reordered);
  }

  const weeks = useMemo(() => buildWeeks(cursor.y, cursor.m), [cursor]);
  const allDatesInMonth = useMemo(() => weeks.flat().filter(Boolean), [weeks]);
  const daysInMonth = allDatesInMonth.length;
  const goalPerHabit = daysInMonth;

  // Weighted count — used for percentage calculations
  function dayCompletedCount(dateStr) {
    return habits.reduce((s, h) => s + (isDone(h.id, dateStr) ? (h.weight || 1) : 0), 0);
  }
  // Raw count — used for display text ("3/10" style)
  function dayCompletedRawCount(dateStr) {
    return habits.reduce((s, h) => s + (isDone(h.id, dateStr) ? 1 : 0), 0);
  }
  function mondayOfLocal(dateStr) {
    return mondayOf(dateStr);
  }

  const today = todayStr();

  const weightSum = useMemo(() => habits.reduce((s, h) => s + (h.weight || 1), 0), [habits]);

  // Top stats are always computed fresh from habits+logs — independent of
  // which month the grid below happens to be browsing.
  const topStats = useMemo(() => {
    // Weighted values (for percentage / progress bar)
    const todayWeighted = dayCompletedCount(today);
    const todayPct = weightSum ? Math.round((todayWeighted / weightSum) * 100) : 0;
    // Raw counts (for display text)
    const todayCompleted = dayCompletedRawCount(today);
    const todayGoal = habits.length;

    const mon = mondayOfLocal(today);
    const weekDates = Array.from({ length: 7 }, (_, i) => addDaysStr(mon, i));
    const weekWeighted = weekDates.reduce((s, d) => s + dayCompletedCount(d), 0);
    const weekWeightedGoal = 7 * weightSum;
    const weekPct = weekWeightedGoal ? Math.round((weekWeighted / weekWeightedGoal) * 100) : 0;
    const weekDone = weekDates.reduce((s, d) => s + dayCompletedRawCount(d), 0);
    const weekGoal = 7 * habits.length;

    const monthWeightedGoal = weightSum * daysInMonth;
    const monthWeighted = allDatesInMonth.reduce((s, d) => s + dayCompletedCount(d), 0);
    const monthPct = monthWeightedGoal ? Math.round((monthWeighted / monthWeightedGoal) * 100) : 0;
    const monthCompleted = allDatesInMonth.reduce((s, d) => s + dayCompletedRawCount(d), 0);
    const monthGoal = habits.length * daysInMonth;

    return { todayCompleted, todayGoal, todayPct, weekDone, weekGoal, weekPct, monthGoal, monthCompleted, monthPct };
  }, [habits, logs, today, allDatesInMonth, daysInMonth, weightSum]);

  const { todayCompleted, todayGoal, todayPct, weekDone, weekGoal, weekPct, monthGoal, monthCompleted, monthPct } = topStats;

  // Per-week totals for bar chart (these intentionally follow the browsed month)
  const weekTotals = useMemo(() => weeks.map(w => {
    const validDays = w.filter(Boolean);
    const weightedDone = validDays.reduce((s, d) => s + dayCompletedCount(d), 0);
    const weightedGoal = validDays.length * weightSum;
    const done = validDays.reduce((s, d) => s + dayCompletedRawCount(d), 0);
    const goal = validDays.length * habits.length;
    return { done, goal, pct: weightedGoal ? Math.round((weightedDone / weightedGoal) * 100) : 0 };
  }), [weeks, logs, habits, weightSum]);

  // Combined per-habit performance: consistency %, current streak, best streak
  const habitPerformance = useMemo(() => {
    const allDates = Object.keys(logs).sort();
    return habits.map(h => {
      const hits = allDatesInMonth.reduce((s, d) => s + (isDone(h.id, d) ? 1 : 0), 0);
      const pct = daysInMonth ? Math.round((hits / daysInMonth) * 100) : 0;

      let current = 0, best = 0, running = 0;
      let cur = today;
      while (isDone(h.id, cur)) { current++; cur = addDaysStr(cur, -1); }
      if (allDates.length) {
        let d = allDates[0];
        const last = allDates[allDates.length - 1];
        while (d <= last) {
          if (isDone(h.id, d)) { running++; best = Math.max(best, running); } else running = 0;
          d = addDaysStr(d, 1);
        }
      }
      best = Math.max(best, current);
      return { ...h, hits, pct, current, best };
    }).sort((a, b) => b.pct - a.pct || b.current - a.current);
  }, [habits, allDatesInMonth, logs, daysInMonth, today]);

  if (loading) {
    return (
      <div style={{ minHeight: 500, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{FONT_IMPORT}</style>
        <Loader2 size={26} color={C.gold} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className="hs-page-root" style={{ position: 'relative', fontFamily: "'Inter',sans-serif", background: C.bg, color: C.ink, minHeight: 700, padding: '20px 16px 40px', overflow: 'hidden', isolation: 'isolate' }}>
      <style>{FONT_IMPORT}</style>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.14); border-radius: 6px; }
        ::selection { background: rgba(232,193,112,0.35); color: #fff; }
        .hs-cell { cursor: pointer; transition: transform .1s ease, box-shadow .1s ease; }
        .hs-cell:hover { transform: scale(1.12); }
        .hs-btn { cursor: pointer; transition: filter .15s ease, transform .1s ease; }
        .hs-btn:hover { filter: brightness(1.08); }
        .hs-btn:active { transform: scale(0.97); }
        .hs-row:hover { background: rgba(255,255,255,0.055) !important; }
        input, select, textarea { color-scheme: dark; }
        input::placeholder, textarea::placeholder { color: #6E6680; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: rgba(232,193,112,0.55) !important; box-shadow: 0 0 0 3px rgba(232,193,112,0.12); }
        select { background-color: #171320 !important; color: #F3EEE2 !important; }
        select option { background-color: #171320; color: #F3EEE2; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(14px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes hsDrift { 0%,100%{ transform: translate(0,0) rotate(0deg); } 50%{ transform: translate(-14px,18px) rotate(6deg); } }
      `}</style>

      {/* Decorative dark canvas: soft gold + violet glows and a faint
          concentric-ring motif, kept fixed and non-interactive so it
          never competes with the actual data. */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', background: `radial-gradient(circle at 14% 8%, rgba(139,127,224,0.16), transparent 42%), radial-gradient(circle at 88% 2%, rgba(232,193,112,0.14), transparent 40%), radial-gradient(circle at 100% 78%, rgba(139,127,224,0.10), transparent 45%), ${C.bgDeep}` }}>
        <svg width="620" height="620" viewBox="0 0 620 620" style={{ position: 'absolute', top: -160, right: -160, opacity: 0.5, animation: 'hsDrift 26s ease-in-out infinite' }}>
          <defs>
            <linearGradient id="hsRing1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E8C170" />
              <stop offset="100%" stopColor="#8B7FE0" />
            </linearGradient>
          </defs>
          {[70, 130, 190, 250].map((r, i) => (
            <circle key={r} cx="310" cy="310" r={r} fill="none" stroke="url(#hsRing1)" strokeWidth={i === 0 ? 2.5 : 1.2} opacity={0.55 - i * 0.1} />
          ))}
        </svg>
        <svg width="480" height="480" viewBox="0 0 480 480" style={{ position: 'absolute', bottom: -140, left: -140, opacity: 0.35 }}>
          {[60, 110, 160].map((r, i) => (
            <circle key={r} cx="240" cy="240" r={r} fill="none" stroke="#8B7FE0" strokeWidth="1" opacity={0.5 - i * 0.12} />
          ))}
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1360, margin: '0 auto' }}>
        {/* Header */}
        <div className="hs-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div className="hs-header-left">
            <div>
              <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 22 }}>{page === 'habits' ? 'Habit Tracker' : page === 'tasks' ? 'Task Tracker' : page === 'today' ? 'Today' : 'Finance Tracker'}</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>
                {page === 'habits'
                  ? `${habits.length} habits · ${daysInMonth} days this month`
                  : page === 'tasks'
                  ? `${tasks.filter(t => t.source !== 'quick' && !t.done).length} pending · ${tasks.filter(t => t.source !== 'quick' && t.done).length} done`
                  : page === 'today'
                  ? `${tasks.filter(t => t.plannedDate === todayStr()).length} planned · ${tasks.filter(t => t.plannedDate === todayStr() && t.done).length} done`
                  : `${transactions.length} transactions logged`}
              </div>
            </div>
          </div>

          <div className="hs-header-center" style={{ display: 'flex', gap: 3, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.line}`, borderRadius: 999, padding: 4 }}>
            {[
              { key: 'habits', label: 'Habits', icon: <Flame size={14} /> },
              { key: 'tasks', label: 'Tasks', icon: <ListChecks size={14} /> },
              { key: 'today', label: 'Today', icon: <Sun size={14} /> },
              { key: 'finance', label: 'Finance', icon: <Wallet size={14} /> },
            ].map(t => {
              const active = page === t.key;
              return (
                <button key={t.key} className="hs-btn hs-nav-btn" onClick={() => setPage(t.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 999,
                  padding: '8px 16px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap',
                  background: active ? 'linear-gradient(135deg, #E8C170, #B4700F)' : 'transparent',
                  color: active ? '#221806' : C.sub,
                  boxShadow: active ? '0 4px 18px rgba(232,193,112,0.32)' : 'none',
                  transition: 'background .2s ease, color .2s ease, box-shadow .2s ease',
                }}>{t.icon}<span>{t.label}</span></button>
              );
            })}
          </div>

          <div className="hs-header-right" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            {page === 'habits' && (
              <>
                <button className="hs-btn" onClick={() => { const d = new Date(); setCursor({ y: d.getFullYear(), m: d.getMonth() }); }}
                  style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: C.gold }}>Today</button>
                <div className="hs-month-picker" style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: '6px 8px' }}>
                  <button className="hs-btn" onClick={() => setCursor(c => { const m = c.m - 1; return m < 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m }; })}
                    style={{ background: 'none', border: 'none', display: 'flex', padding: 6, color: C.ink }}><ChevronLeft size={16} /></button>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14, minWidth: 140, textAlign: 'center' }}>{monthLabel(cursor.y, cursor.m)}</div>
                  <button className="hs-btn" onClick={() => setCursor(c => { const m = c.m + 1; return m > 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m }; })}
                    style={{ background: 'none', border: 'none', display: 'flex', padding: 6, color: C.ink }}><ChevronRight size={16} /></button>
                </div>
              </>
            )}
            <button className="hs-btn" onClick={() => signOut()} title="Sign out"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, color: C.sub }}>
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>

        {page === 'habits' && (
        <>
        {/* Top: donut + quick check-in + progress cards */}
        <div className="hs-habits-top-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(180px,230px) 1fr', gap: 14, marginBottom: 22 }}>
          <div className="hs-habits-donut-box" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 600, alignSelf: 'flex-start' }}>🚀 Today's Progress</div>
            <Donut value={todayCompleted} max={todayGoal} pct={todayPct} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '12px 14px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13.5 }}>Quick Check-in — Today</div>
                <div style={{ fontSize: 11, color: C.sub, fontFamily: "'JetBrains Mono',monospace" }}>{today}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {habits.map(h => {
                  const done = isDone(h.id, today);
                  return (
                    <button key={h.id} onClick={() => toggle(h.id, today)} className="hs-btn" style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 20,
                      background: done ? C.tealDark : 'rgba(255,255,255,0.06)', color: done ? '#fff' : C.ink,
                      border: `1.4px solid ${done ? C.tealDark : C.line}`, fontSize: 12,
                    }}>
                      <span>{h.icon}</span>
                      <span>{h.name}</span>
                      {done && <Check size={12} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="hs-stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <StatCard label="Weekly Progress" value={`${weekDone}/${weekGoal}`} pct={weekPct} />
              <StatCard label="Month's Progress" value={`${monthCompleted}/${monthGoal}`} pct={monthPct} />
            </div>
          </div>
        </div>

        {/* Monthly trend chart */}
        <TrendChart allDatesInMonth={allDatesInMonth} dayCompletedCount={dayCompletedCount} habitsCount={weightSum} today={today} />

        {/* Main grid */}
        <div className="hs-grid-scroll-wrap" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 22, overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15 }}>Habits for {monthLabel(cursor.y, cursor.m)}</div>
            <button onClick={() => setShowAdd(true)} className="hs-btn" style={{
              display: 'flex', alignItems: 'center', gap: 5, background: C.teal, border: 'none',
              borderRadius: 9, padding: '7px 12px', fontSize: 12.5, fontWeight: 600, color: '#2B1B04',
            }}><Plus size={14} /> Add habit</button>
          </div>

          <div style={{ minWidth: 640 + weeks.length * 210 }}>
            {/* Week header row */}
            <div style={{ display: 'flex' }}>
              <div className="hs-grid-sticky-header" style={{ width: 220, flexShrink: 0, background: '#15111E' }} />
              <div style={{ width: 50, flexShrink: 0 }} />
              {weeks.map((w, wi) => {
                const col = WEEK_COLORS[wi % WEEK_COLORS.length];
                return (
                  <div key={wi} style={{ display: 'flex', flexDirection: 'column', width: 210, flexShrink: 0 }}>
                    <div style={{ background: col.head, textAlign: 'center', fontSize: 11, fontWeight: 700, padding: '4px 0', borderRadius: '8px 8px 0 0', color: '#F5F0E4' }}>Week {wi + 1}</div>
                    <div style={{ display: 'flex' }}>
                      {w.map((d, di) => (
                        <div key={di} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, color: C.sub, background: col.bg, padding: '3px 0' }}>{DOW[di]}</div>
                      ))}
                    </div>
                    <div style={{ display: 'flex' }}>
                      {w.map((d, di) => (
                        <div key={di} style={{
                          flex: 1, textAlign: 'center', fontSize: 9.5, fontFamily: "'JetBrains Mono',monospace",
                          color: d === today ? C.warn : C.sub, fontWeight: d === today ? 800 : 400,
                          background: col.bg, padding: '2px 0 5px',
                        }}>
                          {d ? Number(d.slice(-2)) : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Habit rows — drag-and-drop sortable */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                {habits.map(h => {
                  const hitsThisMonth = allDatesInMonth.reduce((s, d) => s + (isDone(h.id, d) ? 1 : 0), 0);
                  return (
                    <SortableHabitRow key={h.id} habit={h} hitsThisMonth={hitsThisMonth} goalPerHabit={goalPerHabit}
                      weeks={weeks} today={today} isDone={isDone} toggle={toggle} setEditHabit={setEditHabit} />
                  );
                })}
              </SortableContext>
            </DndContext>

            {/* Totals row */}
            <div style={{ display: 'flex', alignItems: 'center', borderTop: `2px solid ${C.ink}22`, marginTop: 4 }}>
              <div className="hs-grid-sticky-col" style={{ width: 220, flexShrink: 0, padding: '8px 6px', fontSize: 11.5, fontWeight: 700, background: '#15111E' }}>Daily total</div>
              <div style={{ width: 50, flexShrink: 0 }} />
              {weeks.map((w, wi) => (
                <div key={wi} style={{ display: 'flex', width: 210, flexShrink: 0 }}>
                  {w.map((d, di) => (
                    <div key={di} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: C.sub, padding: '6px 0' }}>
                      {d ? dayCompletedRawCount(d) : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="hs-grid-sticky-col" style={{ width: 220, flexShrink: 0, padding: '2px 6px 10px', fontSize: 10.5, color: C.sub, background: '#15111E' }}>Week %</div>
              <div style={{ width: 50, flexShrink: 0 }} />
              {weeks.map((w, wi) => (
                <div key={wi} style={{ width: 210, flexShrink: 0, textAlign: 'center', fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: weekTotals[wi].pct >= 50 ? C.tealDark : C.bad, paddingBottom: 8 }}>
                  {weekTotals[wi].done}/{weekTotals[wi].goal} ({weekTotals[wi].pct}%)
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly bar chart */}
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 22 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 14 }}>Weekly Completion</div>
          <div className="hs-weekly-bar-gap" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 130 }}>
            {weekTotals.map((w, wi) => (
              <div key={wi} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", color: C.sub }}>{w.pct}%</div>
                <div style={{ width: '60%', height: `${Math.max(4, w.pct)}%`, borderRadius: '6px 6px 0 0', background: WEEK_COLORS[wi % WEEK_COLORS.length].head }} />
                <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 600 }}>W{wi + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Combined habit performance table */}
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Habit Performance</div>
          <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 12 }}>Consistency this month, ranked, with streaks</div>
          <div style={{ display: 'flex', fontSize: 10, color: C.sub, fontWeight: 700, padding: '0 2px 6px', borderBottom: `1px solid ${C.line}` }}>
            <div style={{ width: 22 }}>#</div>
            <div style={{ flex: 1 }}>Habit</div>
            <div style={{ width: 130, textAlign: 'right' }}>This month</div>
            <div style={{ width: 66, textAlign: 'right' }}>Current</div>
            <div style={{ width: 56, textAlign: 'right' }}>Best</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {habitPerformance.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', padding: '9px 2px', borderBottom: `1px solid ${C.line}` }}>
                <div style={{ width: 22, fontSize: 10.5, color: C.sub }}>{i + 1}</div>
                <div className="hs-perf-habit-col" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <span style={{ fontSize: 14 }}>{h.icon}</span>
                  <span style={{ fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</span>
                </div>
                <div style={{ width: 130, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  <div style={{ width: 60, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
                    <div style={{ width: `${h.pct}%`, height: '100%', background: h.pct >= 70 ? C.good : h.pct >= 40 ? C.warn : C.bad }} />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, width: 34, textAlign: 'right', color: C.sub }}>{h.pct}%</span>
                </div>
                <div style={{ width: 66, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, fontFamily: "'JetBrains Mono',monospace", color: h.current > 0 ? C.tealDark : C.sub, fontWeight: 700, fontSize: 12.5 }}>
                  {h.current > 0 && <Flame size={11} color={C.warn} fill={C.warn} />}{h.current}
                </div>
                <div style={{ width: 56, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", color: C.sub, fontSize: 12.5 }}>{h.best}</div>
              </div>
            ))}
          </div>
        </div>
        </>
        )}

        {page === 'tasks' && (
          <TaskTrackerView
            tasks={tasks}
            categories={categories}
            filterCat={filterCat}
            setFilterCat={setFilterCat}
            taskSort={taskSort}
            setTaskSort={setTaskSort}
            onToggle={toggleTaskDone}
            onAddTask={addTask}
            onEdit={(t) => setEditTask(t)}
            onManageCats={() => setShowCatPanel(true)}
            onClearCompleted={clearCompletedTasks}
            onPlanToday={setTaskPlannedDate}
          />
        )}

        {page === 'today' && (
          <TodayView
            tasks={tasks}
            categories={categories}
            goals={goals}
            onToggle={toggleTaskDone}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onSetPlannedDate={setTaskPlannedDate}
            onDeleteTask={deleteTask}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
          />
        )}

        {page === 'finance' && (
          <FinanceTrackerView
            transactions={transactions}
            categories={financeCategories}
            filterCat={finFilterCat}
            setFilterCat={setFinFilterCat}
            typeFilter={finTypeFilter}
            setTypeFilter={setFinTypeFilter}
            onAdd={addTransaction}
            onEdit={(t) => setEditTxn(t)}
            onManageCats={() => setShowFinCatPanel(true)}
          />
        )}

        {toast && (
          <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: C.panelSolid, border: `1px solid ${C.line}`, color: C.ink, padding: '9px 18px', borderRadius: 10, fontSize: 12.5, zIndex: 60, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>{toast}</div>
        )}
      </div>

      {(showAdd || editHabit) && (
        <HabitModal habit={editHabit} onClose={() => { setShowAdd(false); setEditHabit(null); }} onSave={editHabit ? updateHabit : addHabit} onDelete={editHabit ? () => deleteHabit(editHabit.id) : null} />
      )}
      {editTask && (
        <TaskModal task={editTask} categories={categories} goals={goals} onClose={() => setEditTask(null)} onSave={updateTask} onDelete={() => deleteTask(editTask.id)} />
      )}
      {showCatPanel && (
        <CategoryPanel categories={categories} onClose={() => setShowCatPanel(false)} onAdd={addCategory} onEdit={editCategory} onDelete={deleteCategory} />
      )}
      {editTxn && (
        <TransactionModal txn={editTxn} categories={financeCategories} onClose={() => setEditTxn(null)} onSave={updateTransaction} onDelete={() => deleteTransaction(editTxn.id)} />
      )}
      {showFinCatPanel && (
        <FinanceCategoryPanel categories={financeCategories} onClose={() => setShowFinCatPanel(false)} onAdd={addFinanceCategory} onEdit={editFinanceCategory} onDelete={deleteFinanceCategory} />
      )}
    </div>
  );
}

