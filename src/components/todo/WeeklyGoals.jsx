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
    <div className="hs-card-hover" style={{
      background: 'rgba(21, 17, 32, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${C.line}`,
      borderRadius: 18,
      padding: 16,
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: goals.length > 0 ? 14 : 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(157, 141, 241, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={16} color={C.violet} />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14.5 }}>Weekly Goals</span>
        </div>
        <button onClick={() => { setEditGoal(null); setShowModal(true); }} className="hs-btn" style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(157, 141, 241, 0.15)', border: '1px solid rgba(157, 141, 241, 0.35)',
          borderRadius: 999, padding: '5px 12px', fontSize: 11.5, fontWeight: 700,
          color: C.violet, cursor: 'pointer',
        }}>
          <Plus size={13} strokeWidth={2.6} /> Add goal
        </button>
      </div>

      {goals.length === 0 && (
        <div style={{ textAlign: 'center', padding: '12px 0 6px', color: C.sub, fontSize: 12.5 }}>
          No goals this week — add one to track progress!
        </div>
      )}

      {goals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {goals.map(g => {
            const progress = goalProgress[g.id] || 0;
            const pct = Math.min(100, Math.round((progress / g.targetCount) * 100));
            const isMet = progress >= g.targetCount;
            return (
              <div key={g.id} className="hs-row" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${isMet ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                boxSizing: 'border-box',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.ink, wordBreak: 'break-word' }}>{g.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%', borderRadius: 999,
                        background: isMet ? 'linear-gradient(90deg, #10B981, #34D399)' : 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                        boxShadow: isMet ? '0 0 8px rgba(52, 211, 153, 0.4)' : '0 0 8px rgba(139, 92, 246, 0.4)',
                        transition: 'width .3s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: isMet ? '#34D399' : C.sub, whiteSpace: 'nowrap', fontWeight: 700 }}>
                      {progress} / {g.targetCount}{g.unit ? ` ${g.unit}` : ''}
                    </span>
                  </div>
                </div>
                <button onClick={() => { setEditGoal(g); setShowModal(true); }} className="hs-btn" style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                  <Pencil size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <GoalModal
          goal={editGoal}
          onSave={handleSave}
          onDelete={editGoal ? handleDelete : null}
          onClose={() => { setShowModal(false); setEditGoal(null); }}
        />
      )}
    </div>
  );
}
