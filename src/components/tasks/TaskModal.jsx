import { C, FONT_IMPORT } from '../../theme.js';
import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { PRIORITY } from './taskHelpers.js';

export default function TaskModal({ task, categories, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task?.title || '');
  const [due, setDue] = useState(task?.due || '');
  const [priority, setPriority] = useState(task?.priority || 'med');
  const [category, setCategory] = useState(task?.category ?? categories[0]?.id ?? null);
  const [notes, setNotes] = useState(task?.notes || '');

  function submit() {
    if (!title.trim()) return;
    onSave({ id: task?.id, title: title.trim(), due: due || null, priority, category, notes: notes.trim() || null });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,5,10,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn .15s ease' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#18141F', borderRadius: 18, width: '90%', maxWidth: 380, padding: 20, animation: 'slideUp .2s ease', fontFamily: "'Inter',sans-serif", color: C.ink }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15 }}>{task ? 'Edit Task' : 'New Task'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer' }}><X size={17} /></button>
        </div>

        <label style={{ fontSize: 11.5, color: C.sub }}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Finish VibeForge team registration" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 14px', outline: 'none' }} />

        <label style={{ fontSize: 11.5, color: C.sub }}>Category</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0 14px' }}>
          {categories.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} className="hs-btn" style={{
              padding: '6px 11px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
              background: category === c.id ? c.color + '22' : 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${category === c.id ? c.color : C.line}`,
              color: category === c.id ? c.color : C.sub,
            }}>{c.name}</button>
          ))}
        </div>

        <label style={{ fontSize: 11.5, color: C.sub }}>Due date (optional)</label>
        <input type="date" value={due} onChange={e => setDue(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 14px', outline: 'none', fontFamily: "'JetBrains Mono',monospace" }} />

        <label style={{ fontSize: 11.5, color: C.sub }}>Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any extra detail…" rows={2} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 14px', outline: 'none', resize: 'vertical', fontFamily: "'Inter',sans-serif" }} />

        <label style={{ fontSize: 11.5, color: C.sub }}>Priority</label>
        <div style={{ display: 'flex', gap: 6, margin: '6px 0 18px' }}>
          {Object.entries(PRIORITY).map(([key, p]) => (
            <button key={key} onClick={() => setPriority(key)} className="hs-btn" style={{
              flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12, fontWeight: 600,
              background: priority === key ? p.color + '22' : 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${priority === key ? p.color : C.line}`,
              color: priority === key ? p.color : C.sub,
            }}>{p.label}</button>
          ))}
        </div>

        <button onClick={submit} className="hs-btn" style={{ width: '100%', padding: '11px', borderRadius: 11, border: 'none', background: C.tealDark, color: '#fff', fontWeight: 700, fontSize: 13.5, marginBottom: onDelete ? 8 : 0 }}>{task ? 'Save Changes' : 'Add Task'}</button>
        {onDelete && (
          <button onClick={onDelete} className="hs-btn" style={{ width: '100%', padding: '9px', borderRadius: 11, border: `1px solid ${C.bad}66`, background: 'transparent', color: C.bad, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Trash2 size={12} /> Delete task</button>
        )}
      </div>
    </div>
  );
}
