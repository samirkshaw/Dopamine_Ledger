import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { C } from '../../theme.js';

export default function InlineAddTask({ categories, onAddTask }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.id ?? null);
  const [priority, setPriority] = useState('med');
  const [due, setDue] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  function submit() {
    if (!title.trim()) return;
    onAddTask({ title: title.trim(), category, priority, due: due || null, notes: notes.trim() || null });
    setTitle(''); setDue(''); setNotes(''); setShowNotes(false);
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 18 }}>
      <div className="hs-inline-add-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="What needs doing?"
          className="hs-touch-target"
          style={{ flex: '2 1 200px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 13, outline: 'none' }}
        />
        <div className="hs-inline-add-row" style={{ display: 'flex', gap: 8, flex: '1 1 260px' }}>
          <select value={category ?? ''} onChange={e => setCategory(e.target.value)} className="hs-touch-target" style={{
            flex: '1 1 130px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 12.5, outline: 'none',
          }}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="hs-touch-target" style={{
            flex: '1 1 130px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 12.5, outline: 'none',
          }}>
            <option value="high">High priority</option>
            <option value="med">Medium priority</option>
            <option value="low">Low priority</option>
          </select>
        </div>
        <div className="hs-inline-add-row" style={{ display: 'flex', gap: 8, flex: '1 1 260px' }}>
          <input type="date" value={due} onChange={e => setDue(e.target.value)} className="hs-touch-target" style={{
            flex: '1 1 140px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 12.5, outline: 'none', fontFamily: "'JetBrains Mono',monospace",
          }} />
          <button onClick={() => setShowNotes(s => !s)} className="hs-btn hs-touch-target" title="Add notes" style={{
            flex: '0 0 auto', width: 38, height: 38, borderRadius: 10, border: `1px solid ${C.line}`,
            background: showNotes ? 'rgba(255,255,255,0.06)' : 'transparent', color: C.sub, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Pencil size={14} /></button>
          <button onClick={submit} className="hs-btn hs-touch-target" style={{
            flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 5, background: C.teal, border: 'none',
            borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#2B1B04', whiteSpace: 'nowrap',
          }}><Plus size={15} /> Add task</button>
        </div>
      </div>
      {showNotes && (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Optional notes…"
          rows={2}
          style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 12.5, outline: 'none', resize: 'vertical', fontFamily: "'Inter',sans-serif" }}
        />
      )}
    </div>
  );
}
