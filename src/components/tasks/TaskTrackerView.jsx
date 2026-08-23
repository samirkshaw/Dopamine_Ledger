import { useState, useMemo } from 'react';
import { Trash2, CalendarClock, Sparkles } from 'lucide-react';
import { C } from '../../theme.js';
import { todayStr, addDaysStr } from '../../lib/dateHelpers.js';
import { textOn } from '../../lib/format.js';
import { PRIORITY, catById, priRank } from './taskHelpers.js';
import StatCard from '../common/StatCard.jsx';
import TaskSection from './TaskSection.jsx';
import InlineAddTask from './InlineAddTask.jsx';

export default function TaskTrackerView({ tasks: allTasks, categories, filterCat, setFilterCat, taskSort, setTaskSort, onToggle, onAddTask, onEdit, onManageCats, onClearCompleted, onPlanToday }) {
  const tasks = useMemo(() => allTasks.filter(t => (t.source || 'task') === 'task'), [allTasks]);
  const today = todayStr();
  const [query, setQuery] = useState('');
  const [priFilter, setPriFilter] = useState('all');

  const categoryStats = useMemo(() => {
    return categories.map(c => {
      const catTasks = tasks.filter(t => t.category === c.id);
      const done = catTasks.filter(t => t.done).length;
      const pct = catTasks.length ? Math.round((done / catTasks.length) * 100) : 0;
      return { ...c, total: catTasks.length, done, pct };
    }).filter(c => c.total > 0);
  }, [tasks, categories]);

  // Completion trend: tasks finished per day, last 7 days — independent of filters.
  const completionTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => addDaysStr(today, i - 6));
    return days.map(d => ({ date: d, count: tasks.filter(t => t.doneAt === d).length }));
  }, [tasks, today]);
  const completedThisWeek = completionTrend.reduce((s, d) => s + d.count, 0);
  const completionRate = tasks.length ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;

  const searched = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.trim().toLowerCase();
    return tasks.filter(t => t.title.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q));
  }, [tasks, query]);

  const catFiltered = useMemo(() => filterCat === 'all' ? searched : searched.filter(t => t.category === filterCat), [searched, filterCat]);
  const filtered = useMemo(() => priFilter === 'all' ? catFiltered : catFiltered.filter(t => t.priority === priFilter), [catFiltered, priFilter]);

  const { overdue, dueToday, thisWeek, upcoming, noDate, completed } = useMemo(() => {
    const overdue = [], dueToday = [], thisWeek = [], upcoming = [], noDate = [], completed = [];
    for (const t of filtered) {
      if (t.done) { completed.push(t); continue; }
      if (!t.due) { noDate.push(t); continue; }
      const diff = Math.round((new Date(t.due + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
      if (diff < 0) overdue.push(t);
      else if (diff === 0) dueToday.push(t);
      else if (diff <= 7) thisWeek.push(t);
      else upcoming.push(t);
    }
    const sortFn = (a, b) => {
      if (taskSort === 'priority') return (priRank[a.priority] ?? 1) - (priRank[b.priority] ?? 1);
      if (taskSort === 'category') return catById(categories, a.category).name.localeCompare(catById(categories, b.category).name);
      // deadline
      if (a.due && b.due) return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
      if (a.due) return -1;
      if (b.due) return 1;
      return 0;
    };
    overdue.sort(sortFn); dueToday.sort(sortFn); thisWeek.sort(sortFn); upcoming.sort(sortFn); noDate.sort(sortFn);
    completed.sort((a, b) => (b.doneAt || '').localeCompare(a.doneAt || ''));
    return { overdue, dueToday, thisWeek, upcoming, noDate, completed };
  }, [filtered, today, taskSort, categories]);

  const pendingTotal = overdue.length + dueToday.length + thisWeek.length + upcoming.length + noDate.length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 18 }}>
        <StatCard label="Pending" value={pendingTotal} pct={100} flat />
        <StatCard label="Overdue" value={overdue.length} pct={100} flat />
        <StatCard label="Due this week" value={dueToday.length + thisWeek.length} pct={100} flat />
        <StatCard label="Completed" value={completed.length} pct={100} flat />
        <StatCard label="Completion rate" value={`${completionRate}%`} pct={100} flat />
      </div>

      <InlineAddTask categories={categories} onAddTask={onAddTask} />

      {/* Weekly completion momentum */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sparkles size={14} color={C.tealDark} />
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15 }}>This Week's Momentum</div>
          </div>
          <div style={{ fontSize: 11.5, color: C.sub }}>{completedThisWeek} task{completedThisWeek === 1 ? '' : 's'} finished</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 70 }}>
          {completionTrend.map((d, i) => {
            const max = Math.max(1, ...completionTrend.map(x => x.count));
            const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })[0];
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                {d.count > 0 && <div style={{ fontSize: 9.5, color: C.sub, fontFamily: "'JetBrains Mono',monospace" }}>{d.count}</div>}
                <div style={{
                  width: '55%', minHeight: 4, height: `${Math.max(6, (d.count / max) * 100)}%`, borderRadius: '5px 5px 0 0',
                  background: d.date === today ? C.warn : C.teal,
                }} />
                <div style={{ fontSize: 10, color: d.date === today ? C.warn : C.sub, fontWeight: d.date === today ? 800 : 600 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {categoryStats.length > 0 && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>By Category</div>
          <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 12 }}>Completion progress across your categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categoryStats.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 140, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: c.color, fontWeight: 600 }}>{c.name}</div>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: c.color }} />
                </div>
                <div style={{ width: 60, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: C.sub }}>{c.done}/{c.total}</div>
                <div style={{ width: 38, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.sub }}>{c.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks…"
            style={{
              fontSize: 12, padding: '7px 12px', borderRadius: 20, border: `1.4px solid ${C.line}`,
              background: 'transparent', color: C.ink, outline: 'none', width: 150,
            }}
          />
          <button onClick={() => setFilterCat('all')} className="hs-btn" style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '6px 12px', borderRadius: 20,
            border: `1.4px solid ${filterCat === 'all' ? C.chip : C.line}`,
            background: filterCat === 'all' ? C.chip : 'transparent', color: filterCat === 'all' ? '#fff' : C.sub,
          }}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setFilterCat(c.id)} className="hs-btn" style={{
              fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '6px 12px', borderRadius: 20,
              border: `1.4px solid ${filterCat === c.id ? c.color : C.line}`,
              background: filterCat === c.id ? c.color : 'transparent', color: filterCat === c.id ? textOn(c.color) : C.sub,
            }}>{c.name}</button>
          ))}
          <button onClick={onManageCats} className="hs-btn" title="Manage categories" style={{
            width: 30, height: 30, borderRadius: '50%', border: `1.4px solid ${C.line}`, background: 'transparent', color: C.sub,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⚙</button>
        </div>
        <select value={taskSort} onChange={e => setTaskSort(e.target.value)} style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '7px 8px', borderRadius: 9,
          border: `1px solid ${C.line}`, background: C.panel, color: C.sub,
        }}>
          <option value="deadline">Sort: deadline</option>
          <option value="priority">Sort: priority</option>
          <option value="category">Sort: category</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 16, marginTop: -6 }}>
        <span style={{ fontSize: 10.5, color: C.sub, fontWeight: 600, marginRight: 2 }}>Priority:</span>
        <button onClick={() => setPriFilter('all')} className="hs-btn" style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '5px 11px', borderRadius: 20,
          border: `1.4px solid ${priFilter === 'all' ? C.chip : C.line}`,
          background: priFilter === 'all' ? C.chip : 'transparent', color: priFilter === 'all' ? '#fff' : C.sub,
        }}>All</button>
        {Object.entries(PRIORITY).map(([key, p]) => (
          <button key={key} onClick={() => setPriFilter(key)} className="hs-btn" style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '5px 11px', borderRadius: 20,
            border: `1.4px solid ${priFilter === key ? p.color : C.line}`,
            background: priFilter === key ? p.color : 'transparent', color: priFilter === key ? textOn(p.color) : C.sub,
          }}>{p.label}</button>
        ))}
      </div>

      {pendingTotal === 0 && completed.length === 0 ? (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '28px 16px', textAlign: 'center', color: C.sub, fontSize: 13, marginBottom: 16 }}>
          Nothing here yet — add a task above to get started.
        </div>
      ) : (
        <>
          {overdue.length > 0 && (
            <TaskSection title="Overdue" tint="#E2705A" icon={<CalendarClock size={13} color="#E2705A" />} tasks={overdue} today={today} categories={categories} onToggle={onToggle} onEdit={onEdit} onPlanToday={onPlanToday ? (id) => onPlanToday(id, today) : undefined} />
          )}
          {dueToday.length > 0 && (
            <TaskSection title="Due Today" tint={C.warn} tasks={dueToday} today={today} categories={categories} onToggle={onToggle} onEdit={onEdit} onPlanToday={onPlanToday ? (id) => onPlanToday(id, today) : undefined} />
          )}
          {thisWeek.length > 0 && (
            <TaskSection title="This Week" tint={C.tealDark} tasks={thisWeek} today={today} categories={categories} onToggle={onToggle} onEdit={onEdit} onPlanToday={onPlanToday ? (id) => onPlanToday(id, today) : undefined} />
          )}
          {upcoming.length > 0 && (
            <TaskSection title="Upcoming" tint="#7FA8DE" tasks={upcoming} today={today} categories={categories} onToggle={onToggle} onEdit={onEdit} onPlanToday={onPlanToday ? (id) => onPlanToday(id, today) : undefined} />
          )}
          {noDate.length > 0 && (
            <TaskSection title="No Due Date" tint={C.sub} tasks={noDate} today={today} categories={categories} onToggle={onToggle} onEdit={onEdit} onPlanToday={onPlanToday ? (id) => onPlanToday(id, today) : undefined} />
          )}
          {pendingTotal === 0 && (
            <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '20px 16px', textAlign: 'center', color: C.sub, fontSize: 12.5, marginBottom: 16 }}>
              All caught up — nothing pending right now. 🎉
            </div>
          )}
          {completed.length > 0 && (
            <TaskSection
              title="Completed" tint={C.sub} tasks={completed} today={today} categories={categories} onToggle={onToggle} onEdit={onEdit} dim
              actions={
                <button onClick={onClearCompleted} className="hs-btn" style={{
                  marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: C.sub,
                  background: 'transparent', border: `1px solid ${C.line}`, borderRadius: 20, padding: '4px 10px',
                }}><Trash2 size={10} /> Clear completed</button>
              }
            />
          )}
        </>
      )}
    </div>
  );
}
