export function formatToCurrency(value: number, currency = 'USD') {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)} ${currency}`;
}
