import { C } from '../../theme.js';

export default function StatCard({ label, value, pct, flat, icon, tone }) {
  return (
    <div className="hs-card-hover" style={{
      background: 'rgba(21, 17, 32, 0.7)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      padding: '13px 15px',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {tone && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2.5,
          background: tone,
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{
          fontSize: 11, color: C.sub, fontWeight: 600,
          letterSpacing: '0.03em', textTransform: 'uppercase',
        }}>
          {label}
        </div>
        {icon && <span style={{ color: tone || C.sub, opacity: 0.85, display: 'flex' }}>{icon}</span>}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 18,
        color: tone || C.ink, marginBottom: flat ? 0 : 8, letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      {!flat && pct !== undefined && (
        <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%',
            background: pct >= 70 ? C.good : pct >= 40 ? C.warn : C.bad,
            borderRadius: 999,
            transition: 'width .4s cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        </div>
      )}
    </div>
  );
}
