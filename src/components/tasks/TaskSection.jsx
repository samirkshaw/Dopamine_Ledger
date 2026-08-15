import { Check, Pencil } from 'lucide-react';
import { C } from '../../theme.js';
import { PRIORITY, catById, dueLabel, toneColor } from './taskHelpers.js';

export default function TaskSection({ title, tint, tasks, today, categories, onToggle, onEdit, dim, emptyText, icon, actions }) {
  if (!tasks.length && !emptyText) return null;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {icon || <div style={{ width: 8, height: 8, borderRadius: 4, background: tint }} />}
        <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 11, color: C.sub, fontFamily: "'JetBrains Mono',monospace" }}>({tasks.length})</div>
        {actions}
      </div>
      {tasks.length === 0 ? (
        <div style={{ fontSize: 12.5, color: C.sub, padding: '6px 2px' }}>{emptyText}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tasks.map(t => {
            const overdue = !t.done && t.due && t.due < today;
            const p = PRIORITY[t.priority] || PRIORITY.med;
            const cat = catById(categories, t.category);
            const due = dueLabel(t.due, today, t.done);
            return (
              <div key={t.id} className="hs-row" style={{
                position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 40px 11px 12px',
                borderRadius: 8, background: overdue ? 'rgba(226,112,90,0.10)' : 'rgba(255,255,255,0.035)',
                borderLeft: `4px solid ${cat.color}`, opacity: dim ? 0.6 : 1,
              }}>
                <div onClick={() => onToggle(t.id)} className="hs-cell" style={{
                  width: 19, height: 19, borderRadius: 6, flexShrink: 0, cursor: 'pointer', marginTop: 1,
                  background: t.done ? C.tealDark : 'rgba(255,255,255,0.05)',
                  border: `1.6px solid ${t.done ? C.tealDark : C.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.done && <Check size={12} color="#fff" strokeWidth={3.2} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {!t.done && (
                      <span title={`${p.label} priority`} style={{ width: 7, height: 7, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 13.5, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? C.sub : C.ink, wordBreak: 'break-word' }}>
                      {t.title}
                    </span>
                  </div>
                  {t.notes && (
                    <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.notes}</div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", color: C.sub }}>
                    <span style={{ color: cat.color, textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 700 }}>{cat.name}</span>
                    <span style={{ color: toneColor(due.tone), fontWeight: due.tone === 'bad' || due.tone === 'warn' ? 700 : 400 }}>{due.text}</span>
                  </div>
                </div>
                <button onClick={() => onEdit(t)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: C.sub, cursor: 'pointer', display: 'flex' }}><Pencil size={12} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
