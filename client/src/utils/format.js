const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrDecimalFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a rupee amount, e.g. 1299 -> "₹1,299". */
export function formatCurrency(amount, { decimals = false } = {}) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';
  return decimals ? inrDecimalFormatter.format(value) : inrFormatter.format(value);
}

/** Percentage saved against the regular price, rounded down to whole percent. */
export function formatDiscount(price, salePrice) {
  if (!price || !salePrice || salePrice >= price) return null;
  return `${Math.round(((price - salePrice) / price) * 100)}% off`;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function formatDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}
