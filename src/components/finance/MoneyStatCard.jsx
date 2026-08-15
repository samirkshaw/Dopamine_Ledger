import { C } from '../../theme.js';

export default function MoneyStatCard({ label, value, icon, tone, sub }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: '11px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: C.sub, fontWeight: 600, marginBottom: 8 }}>
        <span style={{ color: tone, display: 'flex' }}>{icon}</span>{label}
      </div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 17, color: tone }}>{value}</div>
      {sub && (
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: C.sub, marginTop: 5 }}>{sub}</div>
      )}
    </div>
  );
}
