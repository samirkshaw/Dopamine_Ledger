import { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { C, CAT_PALETTE } from '../../theme.js';

export default function CategoryEditRow({ cat, canDelete, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [color, setColor] = useState(cat.color);

  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0', borderBottom: `1px solid ${C.line}` }}>
        <span style={{ width: 14, height: 14, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
        <button onClick={() => { setName(cat.name); setColor(cat.color); setEditing(true); }} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', display: 'flex' }}><Pencil size={13} /></button>
        <button onClick={() => onDelete(cat.id)} disabled={!canDelete} style={{
          background: 'none', border: 'none', color: canDelete ? C.sub : C.line,
          cursor: canDelete ? 'pointer' : 'default', display: 'flex',
        }}><X size={14} /></button>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px 0', borderBottom: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input value={name} onChange={e => setName(e.target.value)} autoFocus style={{
        width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 8,
        padding: '7px 9px', color: C.ink, fontSize: 12.5, outline: 'none',
      }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {CAT_PALETTE.map(hex => (
          <button key={hex} onClick={() => setColor(hex)} style={{
            width: 19, height: 19, borderRadius: '50%', background: hex, cursor: 'pointer',
            border: `2px solid ${color === hex ? C.ink : 'transparent'}`,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => { if (name.trim()) { onSave(cat.id, { name: name.trim(), color }); setEditing(false); } }} className="hs-btn" style={{
          flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', background: C.tealDark, color: '#fff', fontSize: 11.5, fontWeight: 600,
        }}>Save</button>
        <button onClick={() => setEditing(false)} className="hs-btn" style={{
          flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.sub, fontSize: 11.5, fontWeight: 600,
        }}>Cancel</button>
      </div>
    </div>
  );
}
