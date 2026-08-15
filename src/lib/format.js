export function fmtMoney(n) {
  const v = Number(n) || 0;
  const sign = v < 0 ? '-' : '';
  return `${sign}₹${Math.abs(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

// Picks readable text (dark ink or white) against an arbitrary solid fill —
// keeps light category colors (like gold) from swallowing white labels.
export function textOn(hex) {
  if (!hex || hex[0] !== '#') return '#fff';
  const h = hex.length === 4
    ? '#' + [...hex.slice(1)].map(c => c + c).join('')
    : hex;
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#221806' : '#fff';
}
