import { useMemo } from 'react';
import { C } from '../../theme.js';

export default function TrendChart({ allDatesInMonth, dayCompletedCount, habitsCount, today }) {
  const W = 1000, H = 180, PAD = 10;
  const n = allDatesInMonth.length;
  const points = useMemo(() => {
    if (!n || !habitsCount) return [];
    return allDatesInMonth.map((d, i) => {
      const pct = Math.round((dayCompletedCount(d) / habitsCount) * 100);
      const x = n === 1 ? PAD : PAD + (i / (n - 1)) * (W - PAD * 2);
      const y = H - PAD - (pct / 100) * (H - PAD * 2);
      return { x, y, pct, d, isToday: d === today, isFuture: d > today };
    });
  }, [allDatesInMonth, habitsCount, today]);

  if (!points.length) return null;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${H - PAD} L ${points[0].x.toFixed(1)} ${H - PAD} Z`;
  const todayPoint = points.find(p => p.isToday);
  const avgPct = Math.round(points.filter(p => !p.isFuture).reduce((s, p) => s + p.pct, 0) / Math.max(1, points.filter(p => !p.isFuture).length));

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15 }}>Monthly Trend</div>
        <div style={{ fontSize: 11.5, color: C.sub }}>Avg completion: <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: C.ink }}>{avgPct}%</span></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.tealDark} stopOpacity="0.28" />
            <stop offset="100%" stopColor={C.tealDark} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.gold ?? C.warn} />
            <stop offset="100%" stopColor={C.tealDark} />
          </linearGradient>
        </defs>
        {[25, 50, 75].map(g => (
          <line key={g} x1="0" x2={W} y1={H - PAD - (g / 100) * (H - PAD * 2)} y2={H - PAD - (g / 100) * (H - PAD * 2)} stroke={C.line} strokeWidth="1" strokeDasharray="4 5" />
        ))}
        <path d={areaPath} fill="url(#trendFill)" stroke="none" />
        <path d={linePath} fill="none" stroke="url(#trendLine)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        {points.filter(p => !p.isFuture).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.isToday ? 5 : 2.4} fill={p.isToday ? C.warn : C.tealDark} stroke="#fff" strokeWidth={p.isToday ? 1.6 : 0} />
        ))}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: C.sub, fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>
        <span>{Number(allDatesInMonth[0].slice(-2))}</span>
        <span>{todayPoint ? `today: ${todayPoint.pct}%` : ''}</span>
        <span>{Number(allDatesInMonth[allDatesInMonth.length - 1].slice(-2))}</span>
      </div>
    </div>
  );
}
