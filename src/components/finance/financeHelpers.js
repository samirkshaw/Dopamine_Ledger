export const FIN_UNCATEGORIZED = { id: null, name: 'Uncategorized', color: '#9992A6', kind: 'expense' };
export function finCatById(categories, id) { return categories.find(c => c.id === id) || FIN_UNCATEGORIZED; }
export function monthKey(dateStr) { return dateStr.slice(0, 7); }
export function last6MonthKeys() {
  const out = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}
export function monthShortLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}
