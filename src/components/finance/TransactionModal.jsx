import { C, FONT_IMPORT } from '../../theme.js';
import { useState, useMemo, useEffect } from 'react';
import { X, Trash2, ArrowRightLeft, Landmark, Banknote } from 'lucide-react';
import { todayStr } from '../../lib/dateHelpers.js';
import AccountToggle from './AccountToggle.jsx';
import useEnterSubmit from '../../lib/useEnterSubmit.js';

export default function TransactionModal({ txn, categories, onClose, onSave, onDelete }) {
  const [type, setType] = useState(txn?.type || 'expense');
  const [amount, setAmount] = useState(txn ? String(Math.abs(txn.amount)) : '');
  const [note, setNote] = useState(txn?.note || '');
  const [date, setDate] = useState(txn?.date || todayStr());
  const [account, setAccount] = useState(txn?.account || 'bank');
  const [toAccount, setToAccount] = useState(txn?.toAccount || (txn?.account === 'cash' ? 'bank' : 'cash'));
  const relevantCats = useMemo(() => categories.filter(c => c.kind === type), [categories, type]);
  const [category, setCategory] = useState(txn?.category ?? relevantCats[0]?.id ?? null);
  const handleEnter = useEnterSubmit(submit);

  useEffect(() => {
    if (type !== 'transfer' && !relevantCats.find(c => c.id === category)) {
      setCategory(relevantCats[0]?.id ?? null);
    }
  }, [type]); // eslint-disable-line

  function setTransferDirection(from, to) {
    setAccount(from);
    setToAccount(to);
  }

  function submit() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onSave({
      id: txn?.id,
      type,
      amount: amt,
      category: type === 'transfer' ? null : category,
      note: note.trim(),
      date: date || todayStr(),
      account,
      toAccount: type === 'transfer' ? (toAccount || (account === 'bank' ? 'cash' : 'bank')) : null,
    });
  }

  const isTransfer = type === 'transfer';
  const isBankToCash = account === 'bank' && toAccount === 'cash';

  return (
    <div className="hs-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(6,5,10,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, animation: 'fadeIn .15s ease' }} onClick={onClose}>
      <div className="hs-modal-card" onClick={e => e.stopPropagation()} onKeyDown={handleEnter} style={{ background: '#18141F', borderRadius: 18, width: '90%', maxWidth: 380, padding: 20, animation: 'slideUp .2s ease', fontFamily: "'Inter',sans-serif", color: C.ink }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: 15 }}>Edit Transaction</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer' }}><X size={17} /></button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <button type="button" onClick={() => setType('expense')} className="hs-btn" style={{
            flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12, fontWeight: 600,
            background: type === 'expense' ? C.bad : 'rgba(255,255,255,0.06)', color: type === 'expense' ? '#fff' : C.sub, border: 'none',
          }}>− Expense</button>
          <button type="button" onClick={() => setType('income')} className="hs-btn" style={{
            flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12, fontWeight: 600,
            background: type === 'income' ? C.tealDark : 'rgba(255,255,255,0.06)', color: type === 'income' ? '#fff' : C.sub, border: 'none',
          }}>+ Income</button>
          <button type="button" onClick={() => {
            setType('transfer');
            if (account === toAccount) {
              setAccount('bank');
              setToAccount('cash');
            }
          }} className="hs-btn" style={{
            flex: 1, padding: '8px 0', borderRadius: 9, fontSize: 12, fontWeight: 600,
            background: isTransfer ? '#8B5CF6' : 'rgba(255,255,255,0.06)', color: isTransfer ? '#fff' : C.sub, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}><ArrowRightLeft size={12} /> Transfer</button>
        </div>

        <label style={{ fontSize: 11.5, color: C.sub }}>Amount</label>
        <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 14px', outline: 'none', fontFamily: "'JetBrains Mono',monospace" }} />

        <label style={{ fontSize: 11.5, color: C.sub }}>Note</label>
        <input value={note} onChange={e => setNote(e.target.value)} placeholder={isTransfer ? 'Transfer note (optional)' : 'e.g. Groceries at the market'} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 14px', outline: 'none' }} />

        {!isTransfer && (
          <>
            <label style={{ fontSize: 11.5, color: C.sub }}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0 14px' }}>
              {relevantCats.map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} className="hs-btn" style={{
                  padding: '6px 11px', borderRadius: 20, fontSize: 11.5, fontWeight: 600,
                  background: category === c.id ? c.color + '22' : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${category === c.id ? c.color : C.line}`,
                  color: category === c.id ? c.color : C.sub,
                }}>{c.name}</button>
              ))}
            </div>
          </>
        )}

        <label style={{ fontSize: 11.5, color: C.sub }}>{isTransfer ? 'Direction' : 'Account'}</label>
        <div style={{ margin: '6px 0 14px' }}>
          {isTransfer ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setTransferDirection('bank', 'cash')}
                className="hs-btn"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '9px 8px', borderRadius: 10, fontSize: 11.5, fontWeight: 700,
                  background: isBankToCash ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.04)',
                  color: isBankToCash ? '#fff' : C.sub,
                  border: `1px solid ${isBankToCash ? '#8B5CF6' : C.line}`,
                  boxShadow: isBankToCash ? '0 2px 10px rgba(139, 92, 246, 0.3)' : 'none',
                }}
              >
                <Landmark size={12} /> Bank → <Banknote size={12} /> Cash
              </button>
              <button
                type="button"
                onClick={() => setTransferDirection('cash', 'bank')}
                className="hs-btn"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  padding: '9px 8px', borderRadius: 10, fontSize: 11.5, fontWeight: 700,
                  background: !isBankToCash ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)' : 'rgba(255,255,255,0.04)',
                  color: !isBankToCash ? '#fff' : C.sub,
                  border: `1px solid ${!isBankToCash ? '#8B5CF6' : C.line}`,
                  boxShadow: !isBankToCash ? '0 2px 10px rgba(139, 92, 246, 0.3)' : 'none',
                }}
              >
                <Banknote size={12} /> Cash → <Landmark size={12} /> Bank
              </button>
            </div>
          ) : (
            <AccountToggle account={account} setAccount={setAccount} />
          )}
        </div>

        <label style={{ fontSize: 11.5, color: C.sub }}>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, fontSize: 13, margin: '6px 0 18px', outline: 'none', fontFamily: "'JetBrains Mono',monospace" }} />

        <button onClick={submit} className="hs-btn" style={{ width: '100%', padding: '11px', borderRadius: 11, border: 'none', background: isTransfer ? '#8B5CF6' : C.tealDark, color: '#fff', fontWeight: 700, fontSize: 13.5, marginBottom: 8 }}>Save Changes</button>
        <button onClick={onDelete} className="hs-btn" style={{ width: '100%', padding: '9px', borderRadius: 11, border: `1px solid ${C.bad}66`, background: 'transparent', color: C.bad, fontSize: 12.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Trash2 size={12} /> Delete transaction</button>
      </div>
    </div>
  );
}
