import { useState, useMemo, useRef, useCallback } from 'react';
import { Plus, Pencil, Trash2, Target, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { C } from '../../theme.js';
import { mondayOf, todayStr } from '../../lib/dateHelpers.js';
import { listGoalHistory } from '../../lib/db/goals.js';
import GoalModal from './GoalModal.jsx';

export default function WeeklyGoals({ goals, tasks, onAddGoal, onUpdateGoal, onDeleteGoal }) {
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);

  // ── History state (lazy-loaded) ─────────────────────────────────────────────
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);   // null = never fetched
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const historyOffsetRef = useRef(0);
  const PAGE_SIZE = 10;

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

  // ── History helpers ──────────────────────────────────────────────────────────

  const fetchHistory = useCallback(async (append = false) => {
    setHistoryLoading(true);
    try {
      const currentWeekStart = mondayOf(todayStr());
      const offset = append ? historyOffsetRef.current : 0;
      const result = await listGoalHistory(currentWeekStart, PAGE_SIZE, offset);

      const processed = result.weeks.map(w => {
        let targetSum = 0;
        let completedSum = 0;
        for (const g of w.goals) {
          targetSum += g.targetCount;
          // Sum contributions from done tasks for this goal
          let progress = 0;
          for (const t of w.doneTasks) {
            if (t.goalId === g.id) {
              progress += (t.goalContribution || 1);
            }
          }
          // Cap at goal's target
          completedSum += Math.min(progress, g.targetCount);
        }
        const completionRate = targetSum > 0 ? Math.round((completedSum / targetSum) * 100) : null;
        return { weekStart: w.weekStart, goals: w.goals, targetSum, completedSum, completionRate };
      });

      if (append) {
        setHistoryData(prev => [...(prev || []), ...processed]);
      } else {
        setHistoryData(processed);
      }
      historyOffsetRef.current = offset + result.weeks.length;
      setHistoryHasMore(result.hasMore);
    } catch (e) {
      console.error('Failed to load goal history', e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  function toggleHistory() {
    const willOpen = !historyOpen;
    setHistoryOpen(willOpen);
    // Lazy fetch: only on first expand, when data hasn't been loaded yet
    if (willOpen && historyData === null) {
      fetchHistory(false);
    }
  }

  function loadMore() {
    fetchHistory(true);
  }

  // ── Week label helper ────────────────────────────────────────────────────────

  function weekLabel(weekStartStr) {
    const start = new Date(weekStartStr + 'T00:00:00');
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}`;
  }

  // ── Rate bar color (reuses StatCard color logic) ─────────────────────────────

  function rateColor(pct) {
    if (pct >= 70) return C.good;
    if (pct >= 40) return C.warn;
    return C.bad;
  }

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

      {/* ── Past Weeks History (collapsible, lazy-loaded) ──────────────────── */}
      <div style={{ marginTop: 16, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
        <button
          onClick={toggleHistory}
          className="hs-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 6, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 0', color: C.sub, fontSize: 12.5, fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {historyOpen
            ? <ChevronDown size={14} strokeWidth={2.4} />
            : <ChevronRight size={14} strokeWidth={2.4} />
          }
          Past Weeks
        </button>

        {historyOpen && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historyLoading && !historyData && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', color: C.sub, gap: 8, fontSize: 12.5 }}>
                <Loader2 size={14} className="hs-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Loading history…
              </div>
            )}

            {historyData && historyData.length === 0 && (
              <div style={{ textAlign: 'center', padding: '12px 0', color: C.sub, fontSize: 12.5 }}>
                No past weeks with goals yet.
              </div>
            )}

            {historyData && historyData.length > 0 && (
              <>
                {historyData.map(w => (
                  <div key={w.weekStart} style={{
                    padding: '10px 12px', borderRadius: 12,
                    background: 'rgba(255,255,255,0.025)',
                    border: `1px solid rgba(255,255,255,0.05)`,
                    boxSizing: 'border-box',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: C.ink,
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                        {weekLabel(w.weekStart)}
                      </span>
                      {w.completionRate !== null ? (
                        <span style={{
                          fontSize: 11.5, fontFamily: "'JetBrains Mono',monospace",
                          fontWeight: 700, color: rateColor(w.completionRate),
                        }}>
                          {w.completionRate}% ({w.completedSum}/{w.targetSum})
                        </span>
                      ) : (
                        <span style={{ fontSize: 11.5, color: C.sub, fontStyle: 'italic' }}>
                          No goals set
                        </span>
                      )}
                    </div>
                    {w.completionRate !== null && (
                      <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${Math.min(100, w.completionRate)}%`, height: '100%', borderRadius: 999,
                          background: rateColor(w.completionRate),
                          transition: 'width .4s cubic-bezier(0.16, 1, 0.3, 1)',
                        }} />
                      </div>
                    )}
                  </div>
                ))}

                {historyHasMore && (
                  <button
                    onClick={loadMore}
                    disabled={historyLoading}
                    className="hs-btn"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      width: '100%', padding: '9px 0', borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: `1px solid ${C.line}`,
                      color: C.sub, fontSize: 12, fontWeight: 600,
                      cursor: historyLoading ? 'wait' : 'pointer',
                      opacity: historyLoading ? 0.6 : 1,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {historyLoading ? (
                      <>
                        <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                        Loading…
                      </>
                    ) : (
                      'Load more'
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <GoalModal
          goal={editGoal}
          onSave={handleSave}
          onDelete={editGoal ? handleDelete : null}
          onClose={() => { setShowModal(false); setEditGoal(null); }}
        />
      )}

      {/* Inline keyframe for spinner — reuses pattern from elsewhere in the app */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
