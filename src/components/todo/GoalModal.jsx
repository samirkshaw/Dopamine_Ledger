import { C, FONT_IMPORT } from '../../theme.js';
import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

export default function GoalModal({ goal, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(goal?.title || '');
  const [targetCount, setTargetCount] = useState(goal?.targetCount || '');
  const [unit, setUnit] = useState(goal?.unit || '');

  function submit() {
    if (!title.trim()) return;
    const count = Number(targetCount);
    if (!count || count <= 0) return;
    onSave({ id: goal?.id, title: title.trim(), targetCount: count, unit: unit.trim() });
  }

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`,
    borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13,
    margin: '6px 0 14px', outline: 'none',
  };

  return (
    <div className="hs-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(6,5,10,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn .15s ease' }} onClick={onClose}>
      <div className="hs-modal-card" onClick={e => e.stopPropagation()} style={{ background: '#18141F', borderRadius: 18, width: '90%', maxWidth: 380, padding: 20, animation: 'slideUp .2s ease', fontFamily: "'Inter',sans-serif", color: C.ink }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15 }}>{goal ? 'Edit Goal' : 'New Weekly Goal'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer' }}><X size={17} /></button>
        </div>

        <label style={{ fontSize: 11.5, color: C.sub }}>Goal title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 14 DSA problems" style={inputStyle} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11.5, color: C.sub }}>Target count</label>
            <input type="number" min="1" value={targetCount} onChange={e => setTargetCount(e.target.value)} placeholder="e.g. 14" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11.5, color: C.sub }}>Unit (optional)</label>
            <input value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. problems" style={inputStyle} />
          </div>
        </div>

        <button onClick={submit} className="hs-btn" style={{ width: '100%', padding: '11px', borderRadius: 11, border: 'none', background: C.tealDark, color: '#fff', fontWeight: 700, fontSize: 13.5, marginBottom: onDelete ? 8 : 0 }}>{goal ? 'Save Changes' : 'Add Goal'}</button>
        {onDelete && (
          <button onClick={onDelete} className="hs-btn" style={{ width: '100%', padding: '9px', borderRadius: 11, border: `1px solid ${C.bad}66`, background: 'transparent', color: C.bad, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Trash2 size={12} /> Delete goal</button>
        )}
      </div>
    </div>
  );
}
