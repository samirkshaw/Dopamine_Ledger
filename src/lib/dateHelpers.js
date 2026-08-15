export function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function todayStr() { return toDateStr(new Date()); }
export function addDaysStr(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return toDateStr(d);
}
export function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
export function buildWeeks(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const totalDays = last.getDate();
  const weeks = [];
  let cur = new Array(startWeekday).fill(null);
  for (let d = 1; d <= totalDays; d++) {
    cur.push(toDateStr(new Date(year, month, d)));
    if (cur.length === 7) { weeks.push(cur); cur = []; }
  }
  if (cur.length) { while (cur.length < 7) cur.push(null); weeks.push(cur); }
  return weeks;
}
export const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
