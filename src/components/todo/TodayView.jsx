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
    padding: '11px 14px', borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    borderLeft: '4px solid transparent',
  };

  const iconBtnStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '5px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700,
    border: `1px solid ${active ? C.gold : C.line}`,
    background: active ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'rgba(255,255,255,0.04)',
    color: active ? '#181003' : C.sub,
    cursor: 'pointer',
  });

  // ── Render a single task row ─────────────────────────────────────────────────

  function renderTaskRow(t) {
    const p = PRIORITY[t.priority] || PRIORITY.med;
    const cat = catById(categories, t.category);
    const goal = goalForTask(t);
    return (
      <div key={t.id} className="hs-row" style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 12,
        background: t.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderLeft: `4px solid ${cat.color}`,
        opacity: t.done ? 0.65 : 1,
      }}>
        {/* Checkbox */}
        <div
          onClick={() => onToggle(t.id)}
          className="hs-cell"
          style={{
            width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
            background: t.done ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255,255,255,0.06)',
            border: `1.6px solid ${t.done ? '#10B981' : C.line}`,
            boxShadow: t.done ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {t.done && <Check size={12} color="#fff" strokeWidth={3.4} />}
        </div>

        {/* Priority dot */}
        {!t.done && (
          <span title={`${p.label} priority`} style={{
            width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0,
            boxShadow: `0 0 6px ${p.color}88`,
          }} />
        )}

        {/* Time badge */}
        {t.scheduledTime && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontFamily: "'JetBrains Mono',monospace", fontWeight: 600,
            color: C.violet, background: 'rgba(157, 141, 241, 0.15)',
            border: '1px solid rgba(157, 141, 241, 0.3)',
            padding: '3px 8px', borderRadius: 8, flexShrink: 0,
          }}>
            <Clock size={11} />
            {formatTime(t.scheduledTime)}
          </span>
        )}

        {/* Title */}
        <span
          onClick={() => setEditTask(t)}
          style={{
            flex: 1, fontSize: 13.5, fontWeight: t.done ? 400 : 500,
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
            fontSize: 10.5, fontWeight: 700, color: C.violet,
            background: 'rgba(157, 141, 241, 0.14)', border: '1px solid rgba(157, 141, 241, 0.35)',
            padding: '2px 8px', borderRadius: 999, flexShrink: 0,
            maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.violet, flexShrink: 0 }} />
            {goal.title}
          </span>
        )}

        {/* Category color dot */}
        {cat.id && (
          <span title={cat.name} style={{
            width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0,
            boxShadow: `0 0 6px ${cat.color}66`,
          }} />
        )}

        {/* Remove from today */}
        <button
          onClick={() => removeFromToday(t)}
          title="Remove from today"
          className="hs-btn"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 24, height: 24, borderRadius: 8, border: `1px solid ${C.line}`,
            background: 'rgba(255,255,255,0.03)', color: C.sub, cursor: 'pointer', flexShrink: 0,
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
      <div className="hs-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 18 }}>
        <StatCard label="Planned today" value={plannedCount} pct={100} flat />
        <StatCard label="Done today" value={doneCount} pct={100} flat />
        <StatCard label="Completion" value={`${completionPct}%`} pct={completionPct} />
      </div>

      {/* ── Stale-item review banner ──────────────────────────────────────── */}
      {staleTasks.length > 0 && (
        <div className="hs-card-hover" style={{
          background: 'rgba(232, 132, 111, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(232, 132, 111, 0.32)',
          borderRadius: 18, padding: '14px 16px', marginBottom: 18,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: C.bad }}>
              ⚠ {staleTasks.length} unfinished task{staleTasks.length > 1 ? 's' : ''} from earlier
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={carryAll} className="hs-btn" style={iconBtnStyle(true)}>
                <ChevronsRight size={13} /> Carry all
              </button>
              <button onClick={dropAll} className="hs-btn" style={{ ...iconBtnStyle(false), borderColor: 'rgba(232,132,111,0.4)', color: C.bad }}>
                <Trash2 size={12} /> Drop all
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {staleTasks.map(t => {
              const cat = catById(categories, t.category);
              const p = PRIORITY[t.priority] || PRIORITY.med;
              return (
                <div key={t.id} className="hs-row" style={{ ...rowStyle, borderLeftColor: cat.color, justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <span title={`${p.label} priority`} style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <span style={{ fontSize: 10.5, color: C.sub, fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'nowrap' }}>{t.plannedDate}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => onSetPlannedDate(t.id, today)} className="hs-btn" style={iconBtnStyle(true)}>
                      <ChevronsRight size={12} /> Carry
                    </button>
                    <button onClick={() => removeFromToday(t)} className="hs-btn" style={{ ...iconBtnStyle(false), borderColor: 'rgba(232,132,111,0.4)', color: C.bad }}>
                      <X size={12} /> Drop
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick-add bar ─────────────────────────────────────────────────── */}
      <div className="hs-card-hover hs-quick-add-bar" style={{
        background: 'rgba(21, 17, 32, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: 14,
        marginBottom: 18,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <input
          value={quickTitle}
          onChange={e => setQuickTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submitQuick(); }}
          placeholder="Quick-add to today…"
          className="hs-touch-target"
          style={{
            flex: '1 1 200px', minWidth: 140, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.line}`,
            borderRadius: 10, padding: '10px 14px', color: C.ink, fontSize: 13.5, outline: 'none',
          }}
        />
        {goals && goals.length > 0 && (
          <select
            value={quickGoalId}
            onChange={e => setQuickGoalId(e.target.value)}
            className="hs-touch-target"
            style={{
              background: '#181324', border: `1px solid ${C.line}`,
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
              width: 50, background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.line}`,
              borderRadius: 10, padding: '10px 8px', color: C.ink, fontSize: 13, outline: 'none', textAlign: 'center',
            }}
          />
        )}
        <button onClick={submitQuick} className="hs-btn hs-touch-target" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #F5C869, #D97706)', border: 'none',
          borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700,
          color: '#181003', whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(245, 200, 105, 0.3)',
        }}>
          <Plus size={15} strokeWidth={2.8} /> Add
        </button>
      </div>

      {/* ── Agenda list ────────────────────────────────────────────────────── */}
      <div className="hs-card-hover" style={{
        background: 'rgba(21, 17, 32, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: 18,
      }}>
        {todayTasks.length === 0 ? (
          // ── Empty state ───────────────────────────────────────────────────
          <div style={{ textAlign: 'center', padding: '36px 16px', color: C.sub, fontSize: 13.5 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
            Nothing planned for today — pull a task in from the Tasks tab, or quick-add one above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Scheduled section */}
            {scheduledTasks.length > 0 && (
              <>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14.5, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} color={C.violet} />
                  Scheduled
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {scheduledTasks.map(renderTaskRow)}
                </div>
              </>
            )}

            {/* Unscheduled section */}
            {unscheduledTasks.length > 0 && (
              <>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14.5, marginBottom: 8, color: scheduledTasks.length > 0 ? C.sub : C.ink }}>
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

