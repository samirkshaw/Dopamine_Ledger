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
    <div className="hs-card-hover" style={{
      background: 'rgba(21, 17, 32, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: `1px solid ${C.line}`,
      borderRadius: 18,
      padding: 16,
      marginBottom: 20,
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setType('expense')}
          className="hs-btn hs-touch-target"
          style={{
            flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: type === 'expense' ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'rgba(255,255,255,0.04)',
            color: type === 'expense' ? '#fff' : C.sub, border: 'none',
            boxShadow: type === 'expense' ? '0 4px 14px rgba(239, 68, 68, 0.35)' : 'none',
            transition: 'all .2s ease',
          }}
        >
          − Expense
        </button>
        <button
          onClick={() => setType('income')}
          className="hs-btn hs-touch-target"
          style={{
            flex: 1, padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: type === 'income' ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255,255,255,0.04)',
            color: type === 'income' ? '#fff' : C.sub, border: 'none',
            boxShadow: type === 'income' ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
            transition: 'all .2s ease',
          }}
        >
          + Income
        </button>
      </div>
      <div className="hs-inline-add-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <input
          type="number" min="0" step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="Amount"
          className="hs-touch-target"
          style={{
            flex: '1 1 110px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.line}`,
            borderRadius: 10, padding: '10px 14px', color: C.ink, fontSize: 13.5, outline: 'none',
            fontFamily: "'JetBrains Mono',monospace",
          }}
        />
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit(); }}
          placeholder="What was it for?"
          className="hs-touch-target"
          style={{
            flex: '2 1 180px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.line}`,
            borderRadius: 10, padding: '10px 14px', color: C.ink, fontSize: 13.5, outline: 'none',
          }}
        />
        <div className="hs-inline-add-row" style={{ display: 'flex', gap: 8, flex: '1 1 260px' }}>
          <select
            value={category ?? ''}
            onChange={e => setCategory(e.target.value)}
            className="hs-touch-target"
            style={{
              flex: '1 1 130px', background: '#181324', border: `1px solid ${C.line}`,
              borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 12.5, outline: 'none',
            }}
          >
            {relevantCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <AccountToggle account={account} setAccount={setAccount} />
        </div>
        <div className="hs-inline-add-row" style={{ display: 'flex', gap: 8, flex: '1 1 260px' }}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="hs-touch-target"
            style={{
              flex: '1 1 140px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.line}`,
              borderRadius: 10, padding: '10px 12px', color: C.ink, fontSize: 12.5, outline: 'none',
              fontFamily: "'JetBrains Mono',monospace",
            }}
          />
          <button
            onClick={submit}
            className="hs-btn hs-touch-target"
            style={{
              flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: type === 'income' ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
              border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700,
              color: '#fff', whiteSpace: 'nowrap',
              boxShadow: type === 'income' ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 4px 14px rgba(239, 68, 68, 0.35)',
            }}
          >
            <Plus size={15} strokeWidth={2.8} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
