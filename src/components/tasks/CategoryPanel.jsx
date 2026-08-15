import { C, CAT_PALETTE, FONT_IMPORT } from '../../theme.js';
import { useState } from 'react';
import { X } from 'lucide-react';
import CategoryEditRow from '../common/CategoryEditRow.jsx';

export default function CategoryPanel({ categories, onClose, onAdd, onEdit, onDelete }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(CAT_PALETTE[0]);

  function submit() {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), color });
    setName('');
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,5,10,0.68)', zIndex: 100, animation: 'fadeIn .15s ease' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'fixed', top: 0, right: 0, height: '100%', width: 320, maxWidth: '88vw',
        background: '#18141F', borderLeft: `1px solid ${C.line}`, display: 'flex', flexDirection: 'column',
        fontFamily: "'Inter',sans-serif", color: C.ink, animation: 'slideIn .2s ease',
      }}>
        <style>{FONT_IMPORT}</style>
        <style>{`@keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }`}</style>
        <div style={{ padding: 18, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: '0.02em' }}>MANAGE CATEGORIES</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer' }}><X size={17} /></button>
        </div>
        <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
          {categories.map(c => (
            <CategoryEditRow key={c.id} cat={c} canDelete={categories.length > 1} onSave={onEdit} onDelete={onDelete} />
          ))}
          <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="New category name" style={{
              width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10,
              padding: '9px 11px', color: C.ink, fontSize: 13, outline: 'none',
            }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CAT_PALETTE.map(hex => (
                <button key={hex} onClick={() => setColor(hex)} style={{
                  width: 22, height: 22, borderRadius: '50%', background: hex, cursor: 'pointer',
                  border: `2px solid ${color === hex ? C.ink : 'transparent'}`,
                }} />
              ))}
            </div>
            <button onClick={submit} className="hs-btn" style={{
              width: '100%', padding: '10px', borderRadius: 10, border: 'none',
              background: C.tealDark, color: '#fff', fontWeight: 700, fontSize: 13,
            }}>+ Add category</button>
          </div>
          <div style={{ fontSize: 11, color: C.sub, marginTop: 16, lineHeight: 1.5 }}>
            Deleting a category moves its tasks to Uncategorized. Categories save automatically.
          </div>
        </div>
      </div>
    </div>
  );
}
