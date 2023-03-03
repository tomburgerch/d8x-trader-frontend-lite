export function formatToCurrency(value: number, currency = 'USD') {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 }).format(value)} ${currency}`;
}
