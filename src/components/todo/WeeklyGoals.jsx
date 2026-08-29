import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Target } from 'lucide-react';
import { C } from '../../theme.js';
import GoalModal from './GoalModal.jsx';

export default function WeeklyGoals({ goals, tasks, onAddGoal, onUpdateGoal, onDeleteGoal }) {
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);

  // Progress for each goal — computed from the full tasks array
  const goalProgress = useMemo(() => {
    const map = {};
    for (const g of goals) {
      map[g.id] = 0;
    }
    for (const t of tasks) {
      if (t.goalId && t.done && map[t.goalId] !== undefined) {
        map[t.goalId] += (t.goalContribution || 1);
      }
    }
    return map;
  }, [goals, tasks]);

  function handleSave(data) {
    if (data.id) {
      onUpdateGoal(data);
    } else {
      onAddGoal(data);
    }
    setShowModal(false);
    setEditGoal(null);
  }

  function handleDelete() {
    if (editGoal) {
      onDeleteGoal(editGoal.id);
      setEditGoal(null);
    }
  }

  return (
    <div style={{
      background: C.panelSolid,
      border: `1px solid ${C.line}`, borderRadius: 16,
      padding: '12px 14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: goals.length > 0 ? 10 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Target size={15} color={C.violet} />
          <span style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14 }}>Weekly Goals</span>
        </div>
        <button onClick={() => { setEditGoal(null); setShowModal(true); }} className="hs-btn" style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'rgba(139,127,224,0.14)', border: `1px solid rgba(139,127,224,0.3)`,
          borderRadius: 20, padding: '5px 10px', fontSize: 11, fontWeight: 600,
          color: C.violet, cursor: 'pointer',
        }}>
          <Plus size={12} /> Add goal
        </button>
      </div>

      {goals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '6px 0 2px', color: C.sub, fontSize: 12 }}>
          No goals this week — add one to track progress!
        </div>
      )}

      {goals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {goals.map(g => {
            const progress = goalProgress[g.id] || 0;
            const pct = Math.min(100, Math.round((progress / g.targetCount) * 100));
            const isMet = progress >= g.targetCount;
            return (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10,
                background: 'rgba(255,255,255,0.035)',
                border: `1px solid ${isMet ? 'rgba(95,203,152,0.3)' : C.line}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: 3,
                        background: isMet ? C.good : C.violet,
                        transition: 'width .3s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: isMet ? C.good : C.sub, whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {progress} / {g.targetCount}{g.unit ? ` ${g.unit}` : ''}
                    </span>
                  </div>
                </div>
                <button onClick={() => { setEditGoal(g); setShowModal(true); }} className="hs-btn" style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                  <Pencil size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {(showModal || editGoal) && (
        <GoalModal
          goal={editGoal}
          onClose={() => { setShowModal(false); setEditGoal(null); }}
          onSave={handleSave}
          onDelete={editGoal ? handleDelete : null}
        />
      )}
    </div>
  );
}
