import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { C } from '../../theme.js';
import { todayStr } from '../../lib/dateHelpers.js';
import AccountToggle from './AccountToggle.jsx';

export default function InlineAddTransaction({ categories, onAdd }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [account, setAccount] = useState('bank');
  const relevantCats = useMemo(() => categories.filter(c => c.kind === type), [categories, type]);
  const [category, setCategory] = useState(relevantCats[0]?.id ?? null);
  const [date, setDate] = useState(todayStr());

  useEffect(() => {
    if (!relevantCats.find(c => c.id === category)) setCategory(relevantCats[0]?.id ?? null);
  }, [type]); // eslint-disable-line

  function submit() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onAdd({ type, amount: amt, category, note: note.trim(), date: date || todayStr(), account });
    setAmount(''); setNote('');
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 18 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button onClick={() => setType('expense')} className="hs-btn hs-touch-target" style={{
          flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
          background: type === 'expense' ? C.bad : 'rgba(255,255,255,0.06)', color: type === 'expense' ? '#fff' : C.sub, border: 'none',
        }}>− Expense</button>
        <button onClick={() => setType('income')} className="hs-btn hs-touch-target" style={{
          flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12.5, fontWeight: 600,
          background: type === 'income' ? C.tealDark : 'rgba(255,255,255,0.06)', color: type === 'income' ? '#fff' : C.sub, border: 'none',
        }}>+ Income</button>
      </div>
      <div className="hs-inline-add-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <input
          type="number" min="0" step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="Amount"
          className="hs-touch-target"
          style={{ flex: '1 1 110px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 13, outline: 'none', fontFamily: "'JetBrains Mono',monospace" }}
        />
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="What was it for?"
          className="hs-touch-target"
          style={{ flex: '2 1 180px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 13, outline: 'none' }}
        />
        <div className="hs-inline-add-row" style={{ display: 'flex', gap: 8, flex: '1 1 260px' }}>
          <select value={category ?? ''} onChange={e => setCategory(e.target.value)} className="hs-touch-target" style={{
            flex: '1 1 130px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 12.5, outline: 'none',
          }}>
            {relevantCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <AccountToggle account={account} setAccount={setAccount} />
        </div>
        <div className="hs-inline-add-row" style={{ display: 'flex', gap: 8, flex: '1 1 260px' }}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="hs-touch-target" style={{
            flex: '1 1 140px', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 12.5, outline: 'none', fontFamily: "'JetBrains Mono',monospace",
          }} />
          <button onClick={submit} className="hs-btn hs-touch-target" style={{
            flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            background: type === 'income' ? C.teal : '#F0C9BE', border: 'none',
            borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: type === 'income' ? '#2B1B04' : '#7A2E1F', whiteSpace: 'nowrap',
          }}><Plus size={15} /> Add</button>
        </div>
      </div>
    </div>
  );
}
