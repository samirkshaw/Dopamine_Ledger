// ---------- Design tokens ----------
// Dark, luxury luminous canvas with warm amber-gold accents and
// electric violet secondaries — ultra-clean glassmorphism.
export const C = {
  bg: '#09070F',
  bgDeep: '#050308',
  panel: 'rgba(255, 255, 255, 0.04)',
  panelElevated: 'rgba(255, 255, 255, 0.065)',
  panelSolid: '#151120',
  panelCard: 'rgba(21, 17, 32, 0.85)',
  ink: '#F8F5EE',
  sub: '#9D93B2',
  subMuted: '#6B6282',
  line: 'rgba(255, 255, 255, 0.08)',
  lineLight: 'rgba(255, 255, 255, 0.14)',
  teal: '#F5C869',
  tealDark: '#C97D10',
  good: '#4ADE80',
  goodDark: '#16A34A',
  warn: '#FBBF24',
  bad: '#F87171',
  badDark: '#DC2626',
  violet: '#9D8DF1',
  violetDark: '#725CE0',
  gold: '#F5C869',
  goldDark: '#C97D10',
  chip: '#251F33',
  glowGold: 'rgba(245, 200, 105, 0.28)',
  glowViolet: 'rgba(157, 141, 241, 0.25)',
  glowGreen: 'rgba(74, 222, 128, 0.25)',
};

// Week-block palette, cycling — luminous tints with saturated header solids
export const WEEK_COLORS = [
  { bg: 'rgba(157, 141, 241, 0.11)', head: '#9D8DF1' }, // violet
  { bg: 'rgba(245, 200, 105, 0.11)', head: '#D48817' }, // gold
  { bg: 'rgba(74, 222, 128, 0.10)',  head: '#22C55E' }, // emerald
  { bg: 'rgba(244, 114, 182, 0.11)', head: '#DB2777' }, // rose
  { bg: 'rgba(96, 165, 250, 0.11)',  head: '#2563EB' }, // sky
];

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`;


export const DEFAULT_HABITS = [
  { id: 'h1', name: 'Deep Code', icon: '💻' },
  { id: 'h2', name: 'Wake Up On Time', icon: '🌅' },
  { id: 'h3', name: 'Exercise', icon: '🏋️' },
  { id: 'h4', name: 'Nutrition', icon: '🥗' },
  { id: 'h5', name: 'No PMO', icon: '🛡️' },
  { id: 'h6', name: 'Read', icon: '📖' },
  { id: 'h7', name: 'Journal', icon: '📝' },
  { id: 'h8', name: 'Plan Tomorrow', icon: '🗺️' },
  { id: 'h9', name: 'Self Care', icon: '🧘' },
  { id: 'h10', name: 'Cut Social Media', icon: '📵' },
];
export const ICON_CHOICES = ['💻', '🌅', '🏋️', '🥗', '🛡️', '📖', '📝', '🗺️', '🧘', '📵', '🎯', '⚡', '🔥', '🧠', '💰', '🎨'];

export const CAT_PALETTE = ['#6FA8D6', '#5FBFA0', '#E08A52', '#A69AE0', '#E8C170', '#E2705A', '#7FBF77', '#ABA599'];
export const DEFAULT_CATEGORIES = [
  { id: 'college', name: 'College', color: '#6FA8D6' },
  { id: 'dsa', name: 'DSA', color: '#5FBFA0' },
  { id: 'hackathon', name: 'Hackathon Prep', color: '#E08A52' },
  { id: 'tutoring', name: 'Tutoring', color: '#A69AE0' },
  { id: 'content', name: 'Content / HQ Dopamine', color: '#E8C170' },
  { id: 'personal', name: 'Personal', color: '#ABA599' },
];

export const DEFAULT_FINANCE_CATEGORIES = [
  { id: 'salary', name: 'Salary', color: '#5FBFA0', kind: 'income' },
  { id: 'freelance', name: 'Freelance', color: '#6FA8D6', kind: 'income' },
  { id: 'other-income', name: 'Other Income', color: '#A69AE0', kind: 'income' },
  { id: 'food', name: 'Food', color: '#E08A52', kind: 'expense' },
  { id: 'rent', name: 'Rent & Bills', color: '#E2705A', kind: 'expense' },
  { id: 'transport', name: 'Transport', color: '#A69AE0', kind: 'expense' },
  { id: 'shopping', name: 'Shopping', color: '#E8C170', kind: 'expense' },
  { id: 'entertainment', name: 'Entertainment', color: '#ABA599', kind: 'expense' },
  { id: 'other-expense', name: 'Other', color: '#7FBF77', kind: 'expense' },
];

export const DEFAULT_NOTE_CATEGORIES = [
  { id: 'lecture', name: 'Lecture Notes', color: '#6FA8D6' },
  { id: 'personal', name: 'Personal', color: '#5FBFA0' },
  { id: 'ideas', name: 'Ideas', color: '#E8C170' },
];

