import { Landmark, Banknote } from 'lucide-react';
import { C } from '../../theme.js';

export default function AccountToggle({ account, setAccount }) {
  return (
    <div style={{ display: 'flex', gap: 6, flex: '1 1 130px' }}>
      <button type="button" onClick={() => setAccount('cash')} className="hs-btn" style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 8px', borderRadius: 10, fontSize: 12,
        fontWeight: 600, background: account === 'cash' ? C.chip : 'rgba(255,255,255,0.06)', color: account === 'cash' ? '#fff' : C.sub, border: 'none',
      }}><Banknote size={13} /> Cash</button>
      <button type="button" onClick={() => setAccount('bank')} className="hs-btn" style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '10px 8px', borderRadius: 10, fontSize: 12,
        fontWeight: 600, background: account === 'bank' ? C.chip : 'rgba(255,255,255,0.06)', color: account === 'bank' ? '#fff' : C.sub, border: 'none',
      }}><Landmark size={13} /> Bank</button>
    </div>
  );
}
