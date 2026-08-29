import { useState, useMemo } from 'react';
import { Check, Plus, X, ChevronsRight, Trash2, Clock } from 'lucide-react';
import { C } from '../../theme.js';
import { todayStr } from '../../lib/dateHelpers.js';
import { priRank, catById, PRIORITY } from '../tasks/taskHelpers.js';
import StatCard from '../common/StatCard.jsx';
import WeeklyGoals from './WeeklyGoals.jsx';
import TaskModal from '../tasks/TaskModal.jsx';

export default function TodayView({ tasks, categories, goals, onToggle, onAddTask, onUpdateTask, onSetPlannedDate, onDeleteTask, onAddGoal, onUpdateGoal, onDeleteGoal }) {
  const today = todayStr();
  const [quickTitle, setQuickTitle] = useState('');
  const [quickGoalId, setQuickGoalId] = useState('');
  const [quickGoalContribution, setQuickGoalContribution] = useState(1);
  const [editTask, setEditTask] = useState(null);

  // ── Derived task lists ──────────────────────────────────────────────────────

  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.plannedDate === today);
  }, [tasks, today]);

  const scheduledTasks = useMemo(() => {
    return todayTasks
      .filter(t => t.scheduledTime)
      .sort((a, b) => (a.scheduledTime < b.scheduledTime ? -1 : a.scheduledTime > b.scheduledTime ? 1 : 0));
  }, [todayTasks]);

  const unscheduledTasks = useMemo(() => {
    return todayTasks
      .filter(t => !t.scheduledTime)
      .sort((a, b) => {
        const pr = (priRank[a.priority] ?? 1) - (priRank[b.priority] ?? 1);
        if (pr !== 0) return pr;
        if (a.due && b.due) return a.due < b.due ? -1 : a.due > b.due ? 1 : 0;
        if (a.due) return -1;
        if (b.due) return 1;
        return 0;
      });
  }, [todayTasks]);

  const staleTasks = useMemo(() => {
    return tasks.filter(t => t.plannedDate && t.plannedDate < today && !t.done);
  }, [tasks, today]);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const plannedCount = todayTasks.length;
  const doneCount = todayTasks.filter(t => t.done).length;
  const completionPct = plannedCount ? Math.round((doneCount / plannedCount) * 100) : 0;

  // ── Quick-add ────────────────────────────────────────────────────────────────

  function submitQuick() {
    const title = quickTitle.trim();
    if (!title) return;
    onAddTask({
      title,
      plannedDate: today,
      priority: 'med',
      category: null,
      due: null,
      notes: null,
      source: 'quick',
      goalId: quickGoalId || null,
      goalContribution: quickGoalId ? (Number(quickGoalContribution) || 1) : 1,
    });
    setQuickTitle('');
    setQuickGoalId('');
    setQuickGoalContribution(1);
  }

  // Remove-from-today: quick items get deleted, real tasks just unplan
  function removeFromToday(task) {
    if (task.source === 'quick') {
      onDeleteTask(task.id);
    } else {
      onSetPlannedDate(task.id, null);
    }
  }

  // ── Stale bulk actions ────────────────────────────────────────────────────────

  function carryAll() {
    staleTasks.forEach(t => onSetPlannedDate(t.id, today));
  }
  function dropAll() {
    staleTasks.forEach(t => removeFromToday(t));
  }

  // ── Goal chip helper (graceful — returns null if goalId doesn't match) ──────

  function goalForTask(task) {
    if (!task.goalId || !goals) return null;
    return goals.find(g => g.id === task.goalId) || null;
  }

  // ── Format time for display ─────────────────────────────────────────────────

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  }

  // ── Shared row styles ─────────────────────────────────────────────────────────

  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,0.035)',
    borderLeft: '3px solid transparent',
  };

  const iconBtnStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
    border: `1px solid ${active ? C.tealDark : C.line}`,
    background: active ? 'rgba(180,112,15,0.18)' : 'transparent',
    color: active ? C.tealDark : C.sub,
    cursor: 'pointer',
  });

  // ── Render a single task row ─────────────────────────────────────────────────

  function renderTaskRow(t) {
    const p = PRIORITY[t.priority] || PRIORITY.med;
    const cat = catById(categories, t.category);
    const goal = goalForTask(t);
    return (
      <div key={t.id} className="hs-row" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 12px', borderRadius: 8,
        background: t.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.045)',
        borderLeft: `4px solid ${cat.color}`,
        opacity: t.done ? 0.65 : 1,
      }}>
        {/* Checkbox */}
        <div
          onClick={() => onToggle(t.id)}
          className="hs-cell"
          style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
            background: t.done ? C.tealDark : 'rgba(255,255,255,0.05)',
            border: `1.6px solid ${t.done ? C.tealDark : C.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {t.done && <Check size={12} color="#fff" strokeWidth={3.2} />}
        </div>

        {/* Priority dot */}
        {!t.done && (
          <span title={`${p.label} priority`} style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
        )}

        {/* Time badge */}
        {t.scheduledTime && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
            color: C.violet, background: 'rgba(139,127,224,0.12)',
            padding: '2px 7px', borderRadius: 6, flexShrink: 0,
          }}>
            <Clock size={10} />
            {formatTime(t.scheduledTime)}
          </span>
        )}

        {/* Title */}
        <span
          onClick={() => setEditTask(t)}
          style={{
            flex: 1, fontSize: 13.5,
            textDecoration: t.done ? 'line-through' : 'none',
            color: t.done ? C.sub : C.ink,
            wordBreak: 'break-word',
            cursor: 'pointer',
          }}
        >
          {t.title}
        </span>

        {/* Goal chip (graceful — no chip if goal not found) */}
        {goal && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, color: C.violet,
            background: 'rgba(139,127,224,0.12)', border: '1px solid rgba(139,127,224,0.25)',
            padding: '2px 8px', borderRadius: 12, flexShrink: 0,
            maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.violet, flexShrink: 0 }} />
            {goal.title}
          </span>
        )}

        {/* Category color dot */}
        {cat.id && (
          <span title={cat.name} style={{
            width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0,
          }} />
        )}

        {/* Remove from today */}
        <button
          onClick={() => removeFromToday(t)}
          title="Remove from today"
          className="hs-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 6, border: `1px solid ${C.line}`,
            background: 'transparent', color: C.sub, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <X size={12} />
        </button>
      </div>
    );
  }

  return (
    <div className="today-layout">
      <div className="today-goals">
        {/* ── Weekly Goals panel (sticky) ────────────────────────────────────── */}
        <WeeklyGoals
          goals={goals || []}
          tasks={tasks}
          onAddGoal={onAddGoal}
          onUpdateGoal={onUpdateGoal}
          onDeleteGoal={onDeleteGoal}
        />
      </div>

      <div className="today-main">

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="hs-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginBottom: 18 }}>
        <StatCard label="Planned today" value={plannedCount} pct={100} flat />
        <StatCard label="Done today" value={doneCount} pct={100} flat />
        <StatCard label="Completion" value={`${completionPct}%`} pct={completionPct} />
      </div>

      {/* ── Stale-item review banner ──────────────────────────────────────── */}
      {staleTasks.length > 0 && (
        <div style={{
          background: 'rgba(232,132,111,0.08)', border: `1px solid rgba(232,132,111,0.28)`,
          borderRadius: 14, padding: '12px 14px', marginBottom: 18,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 13.5, color: C.bad }}>
              ⚠ {staleTasks.length} unfinished task{staleTasks.length > 1 ? 's' : ''} from earlier
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={carryAll} className="hs-btn" style={iconBtnStyle(true)}>
                <ChevronsRight size={11} /> Carry all
              </button>
              <button onClick={dropAll} className="hs-btn" style={{ ...iconBtnStyle(false), borderColor: 'rgba(232,132,111,0.4)', color: C.bad }}>
                <Trash2 size={11} /> Drop all
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {staleTasks.map(t => {
              const cat = catById(categories, t.category);
              const p = PRIORITY[t.priority] || PRIORITY.med;
              return (
                <div key={t.id} style={{ ...rowStyle, borderLeftColor: cat.color, justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <span title={`${p.label} priority`} style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <span style={{ fontSize: 10, color: C.sub, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{t.plannedDate}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => onSetPlannedDate(t.id, today)} className="hs-btn" style={iconBtnStyle(true)}>
                      <ChevronsRight size={11} /> Carry
                    </button>
                    <button onClick={() => removeFromToday(t)} className="hs-btn" style={{ ...iconBtnStyle(false), borderColor: 'rgba(232,132,111,0.4)', color: C.bad }}>
                      <X size={11} /> Drop
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick-add bar ─────────────────────────────────────────────────── */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submitQuick(); }}
          placeholder="Quick-add to today…"
          className="hs-touch-target"
          style={{
            flex: '1 1 200px', minWidth: 140, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`,
            borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 13, outline: 'none',
          }}
        />
        {goals && goals.length > 0 && (
          <select
            value={quickGoalId}
            onChange={e => setQuickGoalId(e.target.value)}
            className="hs-touch-target"
            style={{
              background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`,
              borderRadius: 10, padding: '10px 12px', color: quickGoalId ? C.violet : C.sub,
              fontSize: 12.5, outline: 'none', cursor: 'pointer', maxWidth: 160,
            }}
          >
            <option value="">None</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        )}
        {quickGoalId && (
          <input
            type="number"
            min="1"
            value={quickGoalContribution}
            onChange={e => setQuickGoalContribution(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitQuick(); }}
            placeholder="1"
            title="Counts as (toward goal)"
            className="hs-touch-target"
            style={{
              width: 50, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`,
              borderRadius: 10, padding: '10px 8px', color: C.ink, fontSize: 13, outline: 'none', textAlign: 'center',
            }}
          />
        )}
        <button onClick={submitQuick} className="hs-btn hs-touch-target" style={{
          display: 'flex', alignItems: 'center', gap: 5, background: C.teal, border: 'none',
          borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#2B1B04', whiteSpace: 'nowrap',
        }}>
          <Plus size={15} /> Add
        </button>
      </div>

      {/* ── Agenda list ────────────────────────────────────────────────────── */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
        {todayTasks.length === 0 ? (
          // ── Empty state ───────────────────────────────────────────────────
          <div style={{ textAlign: 'center', padding: '28px 16px', color: C.sub, fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
            Nothing planned for today — pull a task in from the Tasks tab, or quick-add one above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Scheduled section */}
            {scheduledTasks.length > 0 && (
              <>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color={C.violet} />
                  Scheduled
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                  {scheduledTasks.map(renderTaskRow)}
                </div>
              </>
            )}

            {/* Unscheduled section */}
            {unscheduledTasks.length > 0 && (
              <>
                <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 6, color: scheduledTasks.length > 0 ? C.sub : C.ink }}>
                  {scheduledTasks.length > 0 ? 'Unscheduled' : "Today's Checklist"}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {unscheduledTasks.map(renderTaskRow)}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      </div>

      {/* ── Inline edit modal (for editing today items: add time/goal) ──── */}
      {editTask && (
        <TaskModal
          task={editTask}
          categories={categories}
          goals={goals || []}
          onClose={() => setEditTask(null)}
          onSave={(updated) => { onUpdateTask(updated); setEditTask(null); }}
          onDelete={() => { onDeleteTask(editTask.id); setEditTask(null); }}
        />
      )}
    </div>
  );
}

