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
      <div className="hs-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 18 }}>
        <StatCard label="Pending" value={pendingTotal} pct={100} flat />
        <StatCard label="Overdue" value={overdue.length} pct={100} flat />
        <StatCard label="Due this week" value={dueToday.length + thisWeek.length} pct={100} flat />
        <StatCard label="Completed" value={completed.length} pct={100} flat />
        <StatCard label="Completion rate" value={`${completionRate}%`} pct={100} flat />
      </div>

      <InlineAddTask categories={categories} onAddTask={onAddTask} />

      {/* Weekly completion momentum */}
      <div className="hs-card-hover" style={{
        background: 'rgba(21, 17, 32, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: 18,
        marginBottom: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Sparkles size={15} color={C.gold} />
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15 }}>This Week's Momentum</div>
          </div>
          <div style={{ fontSize: 12, color: C.sub, fontWeight: 500 }}>
            <span style={{ color: C.gold, fontWeight: 700 }}>{completedThisWeek}</span> task{completedThisWeek === 1 ? '' : 's'} finished
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 74 }}>
          {completionTrend.map((d, i) => {
            const max = Math.max(1, ...completionTrend.map(x => x.count));
            const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })[0];
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, height: '100%', justifyContent: 'flex-end' }}>
                {d.count > 0 && <div style={{ fontSize: 10, color: C.sub, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{d.count}</div>}
                <div style={{
                  width: '50%', minHeight: 4, height: `${Math.max(6, (d.count / max) * 100)}%`, borderRadius: '6px 6px 0 0',
                  background: d.date === today
                    ? 'linear-gradient(180deg, #F5C869, #D97706)'
                    : 'linear-gradient(180deg, #9D8DF1, #6366F1)',
                  boxShadow: d.date === today ? '0 0 10px rgba(245, 200, 105, 0.3)' : 'none',
                  transition: 'height .3s ease',
                }} />
                <div style={{ fontSize: 10.5, color: d.date === today ? C.gold : C.sub, fontWeight: d.date === today ? 800 : 600 }}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {categoryStats.length > 0 && (
        <div className="hs-card-hover" style={{
          background: 'rgba(21, 17, 32, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.line}`,
          borderRadius: 18,
          padding: 18,
          marginBottom: 18,
        }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>By Category</div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 14 }}>Completion progress across your categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {categoryStats.map(c => (
              <div key={c.id} className="hs-cat-breakdown-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="hs-cat-breakdown-name" style={{ width: 140, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: c.color, fontWeight: 700 }}>{c.name}</div>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', minWidth: 60 }}>
                  <div style={{ width: `${c.pct}%`, height: '100%', background: c.color, borderRadius: 999, boxShadow: `0 0 8px ${c.color}66` }} />
                </div>
                <div style={{ width: 60, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: C.sub }}>{c.done}/{c.total}</div>
                <div style={{ width: 42, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: C.ink, fontWeight: 700 }}>{c.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div className="hs-filter-ribbon" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tasks…"
            style={{
              fontSize: 12.5, padding: '7px 14px', borderRadius: 999, border: `1.4px solid ${C.line}`,
              background: 'rgba(255,255,255,0.04)', color: C.ink, outline: 'none', width: 160,
            }}
          />
          <button onClick={() => setFilterCat('all')} className="hs-btn" style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999,
            border: `1.4px solid ${filterCat === 'all' ? C.gold : C.line}`,
            background: filterCat === 'all' ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'rgba(255,255,255,0.03)',
            color: filterCat === 'all' ? '#181003' : C.sub,
            boxShadow: filterCat === 'all' ? '0 2px 10px rgba(245, 200, 105, 0.3)' : 'none',
          }}>All</button>
          {categories.map(c => {
            const active = filterCat === c.id;
            return (
              <button key={c.id} onClick={() => setFilterCat(c.id)} className="hs-btn" style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999,
                border: `1.4px solid ${active ? c.color : C.line}`,
                background: active ? c.color : 'rgba(255,255,255,0.03)',
                color: active ? textOn(c.color) : C.sub,
                boxShadow: active ? `0 2px 10px ${c.color}44` : 'none',
              }}>{c.name}</button>
            );
          })}
          <button onClick={onManageCats} className="hs-btn" title="Manage categories" style={{
            width: 32, height: 32, borderRadius: '50%', border: `1.4px solid ${C.line}`,
            background: 'rgba(255,255,255,0.03)', color: C.sub,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⚙</button>
        </div>
        <select value={taskSort} onChange={e => setTaskSort(e.target.value)} style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, padding: '7px 10px', borderRadius: 10,
          border: `1px solid ${C.line}`, background: '#161222', color: C.sub, outline: 'none',
        }}>
          <option value="deadline">Sort: deadline</option>
          <option value="priority">Sort: priority</option>
          <option value="category">Sort: category</option>
        </select>
      </div>

      <div className="hs-filter-ribbon" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginBottom: 18, marginTop: -4 }}>
        <span style={{ fontSize: 11, color: C.sub, fontWeight: 700, marginRight: 2, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Priority:</span>
        <button onClick={() => setPriFilter('all')} className="hs-btn" style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 999,
          border: `1.4px solid ${priFilter === 'all' ? C.gold : C.line}`,
          background: priFilter === 'all' ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'rgba(255,255,255,0.03)',
          color: priFilter === 'all' ? '#181003' : C.sub,
        }}>All</button>
        {Object.entries(PRIORITY).map(([key, p]) => {
          const active = priFilter === key;
          return (
            <button key={key} onClick={() => setPriFilter(key)} className="hs-btn" style={{
              fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 999,
              border: `1.4px solid ${active ? p.color : C.line}`,
              background: active ? p.color : 'rgba(255,255,255,0.03)',
              color: active ? textOn(p.color) : C.sub,
              boxShadow: active ? `0 2px 8px ${p.color}44` : 'none',
            }}>{p.label}</button>
          );
        })}
      </div>

      {pendingTotal === 0 && completed.length === 0 ? (
        <div style={{ background: 'rgba(21, 17, 32, 0.7)', backdropFilter: 'blur(16px)', border: `1px solid ${C.line}`, borderRadius: 18, padding: '36px 20px', textAlign: 'center', color: C.sub, fontSize: 13.5, marginBottom: 16 }}>
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
