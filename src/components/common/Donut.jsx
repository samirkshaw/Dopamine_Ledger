import { C } from '../../theme.js';

export default function Donut({ value, max, pct }) {
  const r = 48, circ = 2 * Math.PI * r;
  const strokeColor = pct >= 80 ? C.good : pct >= 40 ? C.warn : C.bad;
  const gradId = `donutGrad-${pct >= 80 ? 'good' : pct >= 40 ? 'warn' : 'bad'}`;

  return (
    <div style={{ position: 'relative', width: 126, height: 126, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="126" height="126" viewBox="0 0 126 126" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="donutGrad-good" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="donutGrad-warn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5C869" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="donutGrad-bad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={strokeColor} floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx="63" cy="63" r={r}
          fill="none"
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth="11"
        />

        {/* Dynamic Progress Stroke */}
        <circle
          cx="63" cy="63" r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="11"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(100, Math.max(0, pct)) / 100)}
          strokeLinecap="round"
          transform="rotate(-90 63 63)"
          filter="url(#donutGlow)"
          style={{ transition: 'stroke-dashoffset .5s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>

      {/* Centered Readout */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, fontSize: 20,
          color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.1,
        }}>
          {value}/{max}
        </div>
        <div style={{
          fontSize: 11.5, color: strokeColor, fontWeight: 700,
          fontFamily: "'JetBrains Mono',monospace", marginTop: 2,
        }}>
          {pct}%
        </div>
      </div>
    </div>
  );
}
