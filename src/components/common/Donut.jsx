import { C } from '../../theme.js';

export default function Donut({ value, max, pct }) {
  const r = 46, circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 118, height: 118 }}>
      <svg width="118" height="118" viewBox="0 0 118 118">
        <circle cx="59" cy="59" r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="14" />
        <circle cx="59" cy="59" r={r} fill="none" stroke={pct >= 70 ? C.good : pct >= 40 ? C.warn : C.bad} strokeWidth="14"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round"
          transform="rotate(-90 59 59)" style={{ transition: 'stroke-dashoffset .4s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 19 }}>{value}/{max}</div>
        <div style={{ fontSize: 11, color: C.sub }}>{pct}%</div>
      </div>
    </div>
  );
}

// ---------- Task Tracker ----------
