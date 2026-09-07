import { C } from '../../theme.js';

export default function MoneyStatCard({ label, value, icon, tone, sub }) {
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
        {icon && <span style={{ color: tone || C.sub, opacity: 0.9, display: 'flex' }}>{icon}</span>}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 18,
        color: tone || C.ink, letterSpacing: '-0.02em',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{
          fontFamily: "'JetBrains Mono',monospace", fontSize: 10.5, color: C.sub,
          marginTop: 6, display: 'flex', alignItems: 'center',
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}
