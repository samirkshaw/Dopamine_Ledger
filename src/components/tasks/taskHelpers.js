import { C } from '../../theme.js';

export const PRIORITY = {
  high: { label: 'High', color: '#E2705A' },
  med: { label: 'Medium', color: '#E8C170' },
  low: { label: 'Low', color: '#7FBF77' },
};
export const priRank = { high: 0, med: 1, low: 2 };
export const UNCATEGORIZED = { id: null, name: 'Uncategorized', color: '#9992A6' };

export function catById(categories, id) { return categories.find(c => c.id === id) || UNCATEGORIZED; }

export function dueLabel(due, today, done) {
  if (!due) return { text: 'No deadline', tone: 'sub' };
  if (done) return { text: due.slice(5), tone: 'sub' };
  const diff = Math.round((new Date(due + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
  if (diff < 0) return { text: `Overdue ${Math.abs(diff)}d`, tone: 'bad' };
  if (diff === 0) return { text: 'Due today', tone: 'warn' };
  if (diff === 1) return { text: 'Due tomorrow', tone: 'warn' };
  if (diff <= 6) return { text: `Due in ${diff}d`, tone: 'ink' };
  return { text: due.slice(5), tone: 'sub' };
}
export function toneColor(tone) {
  return tone === 'bad' ? C.bad : tone === 'warn' ? C.warn : tone === 'ink' ? C.ink : C.sub;
}
