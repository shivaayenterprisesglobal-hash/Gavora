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

/** Whole-percent saving against the regular price, or null when not discounted. */
export function discountPercent(price, salePrice) {
  if (!price || !salePrice || salePrice >= price) return null;
  return Math.round(((price - salePrice) / price) * 100);
}

/** Human-readable discount label, e.g. "23% off". */
export function formatDiscount(price, salePrice) {
  const percent = discountPercent(price, salePrice);
  return percent === null ? null : `${percent}% off`;
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(value, { withTime = false } = {}) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return withTime ? dateTimeFormatter.format(date) : dateFormatter.format(date);
}

/** Pluralises a countable noun, e.g. pluralize(1, 'item') -> "1 item". */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Masks all but the last four digits of a phone number for display. */
export function maskPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `${'•'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}
