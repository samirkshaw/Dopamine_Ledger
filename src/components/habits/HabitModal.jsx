import { C, ICON_CHOICES, FONT_IMPORT } from '../../theme.js';
import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';

export default function HabitModal({ habit, onClose, onSave, onDelete }) {
  const [name, setName] = useState(habit?.name || '');
  const [icon, setIcon] = useState(habit?.icon || '🎯');
  function submit() { if (!name.trim()) return; onSave({ id: habit?.id, name: name.trim(), icon }); }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,5,10,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn .15s ease' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#18141F', borderRadius: 18, width: '90%', maxWidth: 360, padding: 20, animation: 'slideUp .2s ease', fontFamily: "'Inter',sans-serif", color: C.ink }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15 }}>{habit ? 'Edit Habit' : 'New Habit'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer' }}><X size={17} /></button>
        </div>
        <label style={{ fontSize: 11.5, color: C.sub }}>Name</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Deep Code" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 14px', outline: 'none' }} />
        <label style={{ fontSize: 11.5, color: C.sub }}>Icon</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0 18px' }}>
          {ICON_CHOICES.map(ic => (
            <button key={ic} onClick={() => setIcon(ic)} style={{ width: 32, height: 32, borderRadius: 8, fontSize: 15, cursor: 'pointer', background: icon === ic ? C.teal : 'rgba(255,255,255,0.06)', border: `1.5px solid ${icon === ic ? C.tealDark : C.line}` }}>{ic}</button>
          ))}
        </div>
        <button onClick={submit} className="hs-btn" style={{ width: '100%', padding: '11px', borderRadius: 11, border: 'none', background: C.tealDark, color: '#fff', fontWeight: 700, fontSize: 13.5, marginBottom: onDelete ? 8 : 0 }}>{habit ? 'Save Changes' : 'Add Habit'}</button>
        {onDelete && (
          <button onClick={onDelete} className="hs-btn" style={{ width: '100%', padding: '9px', borderRadius: 11, border: `1px solid ${C.bad}66`, background: 'transparent', color: C.bad, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Trash2 size={12} /> Remove habit</button>
        )}
      </div>
    </div>
  );
}

// ---------- Finance Tracker ----------
