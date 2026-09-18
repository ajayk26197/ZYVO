export const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));

export const truncate = (str, n) =>
  str?.length > n ? str.slice(0, n) + '...' : str;

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

export const ORDER_STATUS_COLOR = {
  pending:    'warning',
  confirmed:  'primary',
  preparing:  'warning',
  out_for_delivery: 'primary',
  delivered:  'success',
  cancelled:  'error',
};

export const THEMES = [
  { key: 'fastfood', label: '🔴 Fast Food',  emoji: '🍔' },
  { key: 'gourmet',  label: '🟤 Gourmet',    emoji: '🍷' },
  { key: 'healthy',  label: '🟢 Healthy',    emoji: '🥗' },
  { key: 'modern',   label: '🟣 Modern',     emoji: '✨' },
  { key: 'midnight', label: '⚫ Midnight',   emoji: '🌙' },
];

export const getStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating) ? '★' : '☆').join('');
};
