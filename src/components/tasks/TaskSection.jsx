import { Check, Pencil, CalendarPlus, CalendarCheck } from 'lucide-react';
import { C } from '../../theme.js';
import { todayStr } from '../../lib/dateHelpers.js';
import { PRIORITY, catById, dueLabel, toneColor } from './taskHelpers.js';

export default function TaskSection({ title, tint, tasks, today, categories, onToggle, onEdit, dim, emptyText, icon, actions, onPlanToday }) {
  const todayDate = today || todayStr();
  if (!tasks.length && !emptyText) return null;
  return (
    <div className="hs-card-hover" style={{
      background: 'rgba(21, 17, 32, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${C.line}`,
      borderRadius: 18,
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        {icon || <div style={{ width: 8, height: 8, borderRadius: 4, background: tint, boxShadow: `0 0 8px ${tint}` }} />}
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14.5 }}>{title}</div>
        <div style={{
          fontSize: 11, color: C.sub, fontFamily: "'JetBrains Mono',monospace",
          background: 'rgba(255,255,255,0.06)', padding: '1px 8px', borderRadius: 999,
        }}>
          {tasks.length}
        </div>
        {actions}
      </div>
      {tasks.length === 0 ? (
        <div style={{ fontSize: 12.5, color: C.sub, padding: '6px 2px' }}>{emptyText}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(t => {
            const overdue = !t.done && t.due && t.due < todayDate;
            const p = PRIORITY[t.priority] || PRIORITY.med;
            const cat = catById(categories, t.category);
            const due = dueLabel(t.due, todayDate, t.done);
            const isPlannedToday = t.plannedDate === todayDate;
            return (
              <div key={t.id} className="hs-row" style={{
                position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                borderRadius: 12, background: overdue ? 'rgba(248, 113, 113, 0.08)' : 'rgba(255,255,255,0.03)',
                borderLeft: `4px solid ${cat.color}`, opacity: dim ? 0.6 : 1,
                border: `1px solid ${overdue ? 'rgba(248, 113, 113, 0.25)' : 'rgba(255,255,255,0.05)'}`,
                borderLeftWidth: 4, borderLeftColor: cat.color,
              }}>
                <div onClick={() => onToggle(t.id)} className="hs-cell" style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, cursor: 'pointer', marginTop: 1,
                  background: t.done ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255,255,255,0.06)',
                  border: `1.6px solid ${t.done ? '#10B981' : C.line}`,
                  boxShadow: t.done ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.done && <Check size={12} color="#fff" strokeWidth={3.4} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                    {!t.done && (
                      <span title={`${p.label} priority`} style={{
                        width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0,
                        boxShadow: `0 0 6px ${p.color}88`,
                      }} />
                    )}
                    <span style={{
                      fontSize: 13.5, fontWeight: t.done ? 400 : 500,
                      textDecoration: t.done ? 'line-through' : 'none',
                      color: t.done ? C.sub : C.ink, wordBreak: 'break-word',
                    }}>
                      {t.title}
                    </span>
                  </div>
                  {t.notes && (
                    <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.notes}</div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: C.sub }}>
                    <span style={{ color: cat.color, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{cat.name}</span>
                    <span style={{ color: toneColor(due.tone), fontWeight: due.tone === 'bad' || due.tone === 'warn' ? 700 : 500 }}>{due.text}</span>
                  </div>
                </div>

                {/* Right-side action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, marginTop: 1 }}>
                  {onPlanToday && !t.done && (
                    isPlannedToday ? (
                      <span title="Planned for today" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 26, height: 26, borderRadius: 8,
                        background: 'rgba(245, 200, 105, 0.18)', color: C.gold,
                      }}>
                        <CalendarCheck size={14} />
                      </span>
                    ) : (
                      <button
                        onClick={() => onPlanToday(t.id)}
                        title="Plan for today"
                        className="hs-btn"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 26, height: 26, borderRadius: 8, border: `1px solid ${C.line}`,
                          background: 'rgba(255,255,255,0.03)', color: C.sub, cursor: 'pointer',
                        }}
                      >
                        <CalendarPlus size={14} />
                      </button>
                    )
                  )}
                  <button onClick={() => onEdit(t)} className="hs-btn" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: 8, border: `1px solid ${C.line}`,
                    background: 'rgba(255,255,255,0.03)', color: C.sub, cursor: 'pointer',
                  }}>
                    <Pencil size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
