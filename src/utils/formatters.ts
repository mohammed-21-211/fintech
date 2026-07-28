export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num);
}

export function formatDate(dateStr: string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export function formatMonthYear(monthStr: string, locale = 'en-US'): string {
  const [year, month] = monthStr.split('-');
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
  }).format(new Date(Number(year), Number(month) - 1));
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.slice(0, maxLen - 3) + '...' : str;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMonthRange(offset = 0): { start: string; end: string } {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  return { start, end };
}
