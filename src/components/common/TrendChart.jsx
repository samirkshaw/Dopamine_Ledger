import { useMemo } from 'react';
import { C } from '../../theme.js';

export default function TrendChart({ allDatesInMonth, dayCompletedCount, habitsCount, today }) {
  const W = 1000, H = 180, PAD = 14;
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
  const pastPoints = points.filter(p => !p.isFuture);
  const avgPct = Math.round(pastPoints.reduce((s, p) => s + p.pct, 0) / Math.max(1, pastPoints.length));

  return (
    <div className="hs-trend-chart-card hs-glass hs-card-hover" style={{
      borderRadius: 18, padding: '16px 20px', marginBottom: 22, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: "'Outfit', 'Poppins', sans-serif", fontWeight: 700, fontSize: 16, color: C.ink }}>
            Monthly Consistency Trend
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
            Daily habit completion velocity across the month
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(245, 200, 105, 0.12)', border: '1px solid rgba(245, 200, 105, 0.25)',
          borderRadius: 999, padding: '4px 12px', fontSize: 11.5,
        }}>
          <span style={{ color: C.sub }}>Avg:</span>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 800, color: C.gold }}>
            {avgPct}%
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" className="hs-trend-chart-svg" style={{ display: 'block', overflow: 'hidden' }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5C869" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#9D8DF1" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#9D8DF1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trendLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9D8DF1" />
            <stop offset="60%" stopColor="#F5C869" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
          <filter id="glowLine" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#F5C869" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Reference Grid lines */}
        {[25, 50, 75].map(g => (
          <line
            key={g}
            x1="0" x2={W}
            y1={H - PAD - (g / 100) * (H - PAD * 2)}
            y2={H - PAD - (g / 100) * (H - PAD * 2)}
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        ))}

        {/* Area under curve */}
        <path d={areaPath} fill="url(#trendFill)" stroke="none" />

        {/* Main Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#trendLine)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glowLine)"
        />

        {/* Data points */}
        {pastPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.isToday ? 5.5 : 2.5}
            fill={p.isToday ? '#F5C869' : '#9D8DF1'}
            stroke="#151120"
            strokeWidth={p.isToday ? 2.5 : 1}
          />
        ))}
      </svg>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: 10, color: C.subMuted, fontFamily: "'JetBrains Mono',monospace",
        marginTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: 6,
      }}>
        <span>Day 1</span>
        {todayPoint && (
          <span style={{ color: C.gold, fontWeight: 700 }}>
            Today: {todayPoint.pct}%
          </span>
        )}
        <span>Day {Number(allDatesInMonth[allDatesInMonth.length - 1].slice(-2))}</span>
      </div>
    </div>
  );
}
