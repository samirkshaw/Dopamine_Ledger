import { useState } from 'react';
import { X, Pencil } from 'lucide-react';
import { C, CAT_PALETTE } from '../../theme.js';

export default function CategoryEditRow({ cat, canDelete, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [color, setColor] = useState(cat.color);

  if (!editing) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px',
        borderBottom: `1px solid ${C.line}`, transition: 'background .15s ease',
      }}>
        <span style={{
          width: 12, height: 12, borderRadius: '50%', background: cat.color,
          boxShadow: `0 0 8px ${cat.color}66`, flexShrink: 0,
        }} />
        <span style={{
          flex: 1, fontSize: 13.5, fontWeight: 500, whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis', color: C.ink,
        }}>
          {cat.name}
        </span>
        <button
          onClick={() => { setName(cat.name); setColor(cat.color); setEditing(true); }}
          className="hs-btn"
          title="Edit category"
          style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', display: 'flex', padding: 4 }}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={() => onDelete(cat.id)}
          disabled={!canDelete}
          className="hs-btn"
          title={canDelete ? 'Delete category' : 'Cannot delete the only category'}
          style={{
            background: 'none', border: 'none', color: canDelete ? C.sub : 'rgba(255,255,255,0.15)',
            cursor: canDelete ? 'pointer' : 'default', display: 'flex', padding: 4,
          }}
        >
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '12px 6px', borderBottom: `1px solid ${C.line}`,
      display: 'flex', flexDirection: 'column', gap: 10,
      background: 'rgba(255,255,255,0.02)', borderRadius: 10, margin: '4px 0',
    }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        style={{
          width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`,
          borderRadius: 8, padding: '8px 10px', color: C.ink, fontSize: 13, outline: 'none',
        }}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {CAT_PALETTE.map(hex => (
          <button
            key={hex}
            onClick={() => setColor(hex)}
            style={{
              width: 20, height: 20, borderRadius: '50%', background: hex, cursor: 'pointer',
              border: `2px solid ${color === hex ? '#FFF' : 'transparent'}`,
              boxShadow: color === hex ? `0 0 10px ${hex}` : 'none',
              transition: 'transform .1s ease',
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { if (name.trim()) { onSave(cat.id, { name: name.trim(), color }); setEditing(false); } }}
          className="hs-btn"
          style={{
            flex: 1, padding: '7px 0', borderRadius: 8, border: 'none',
            background: C.tealDark, color: '#fff', fontSize: 12, fontWeight: 700,
          }}
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="hs-btn"
          style={{
            flex: 1, padding: '7px 0', borderRadius: 8, border: `1px solid ${C.line}`,
            background: 'transparent', color: C.sub, fontSize: 12, fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
