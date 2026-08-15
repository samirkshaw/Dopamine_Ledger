import { C } from '../../theme.js';

export default function StatCard({ label, value, pct, flat }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: '11px 13px' }}>
      <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 16, marginBottom: flat ? 0 : 6 }}>{value}</div>
      {!flat && (
        <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 70 ? C.good : pct >= 40 ? C.warn : C.bad, transition: 'width .3s ease' }} />
        </div>
      )}
    </div>
  );
}
