// ---------- Design tokens ----------
// Dark, glassy backdrop with a warm gold brand accent and a violet
// secondary — a luminous-canvas mood without borrowing literal imagery.
export const C = {
  bg: '#0B0912',
  bgDeep: '#060509',
  panel: 'rgba(255,255,255,0.045)',
  panelSolid: '#15111E',
  ink: '#F3EEE2',
  sub: '#9C93AE',
  line: 'rgba(255,255,255,0.09)',
  teal: '#E8C170',
  tealDark: '#B4700F',
  good: '#5FCB98',
  warn: '#E8B454',
  bad: '#E8836F',
  violet: '#8B7FE0',
  gold: '#E8C170',
  chip: '#2B2438',
};

// Week-block palette, cycling — translucent tints over the dark panel,
// each with a richer solid for the pill header.
export const WEEK_COLORS = [
  { bg: 'rgba(139,127,224,0.10)', head: '#8B7FE0' }, // violet
  { bg: 'rgba(232,193,112,0.10)', head: '#B4700F' }, // gold
  { bg: 'rgba(95,203,152,0.09)',  head: '#4F9C6E' }, // mint
  { bg: 'rgba(224,138,169,0.10)', head: '#C77597' }, // rose
  { bg: 'rgba(127,168,222,0.10)', head: '#5A8FC7' }, // sky
];

export const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');`;

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
