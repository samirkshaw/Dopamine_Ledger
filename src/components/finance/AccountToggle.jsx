import { Landmark, Banknote } from 'lucide-react';
import { C } from '../../theme.js';

export default function AccountToggle({ account, setAccount }) {
  return (
    <div style={{ display: 'flex', gap: 6, flex: '1 1 130px' }}>
      <button
        type="button"
        onClick={() => setAccount('cash')}
        className="hs-btn"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700,
          background: account === 'cash' ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'rgba(255,255,255,0.04)',
          color: account === 'cash' ? '#181003' : C.sub,
          border: `1px solid ${account === 'cash' ? C.gold : C.line}`,
          boxShadow: account === 'cash' ? '0 2px 10px rgba(245, 200, 105, 0.3)' : 'none',
        }}
      >
        <Banknote size={14} /> Cash
      </button>
      <button
        type="button"
        onClick={() => setAccount('bank')}
        className="hs-btn"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          padding: '10px 8px', borderRadius: 10, fontSize: 12, fontWeight: 700,
          background: account === 'bank' ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'rgba(255,255,255,0.04)',
          color: account === 'bank' ? '#181003' : C.sub,
          border: `1px solid ${account === 'bank' ? C.gold : C.line}`,
          boxShadow: account === 'bank' ? '0 2px 10px rgba(245, 200, 105, 0.3)' : 'none',
        }}
      >
        <Landmark size={14} /> Bank
      </button>
    </div>
  );
}
