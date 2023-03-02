export function formatToCurrency(value: number, currency = 'USD') {
  return `${new Intl.NumberFormat('en-US').format(value)} ${currency}`;
}
