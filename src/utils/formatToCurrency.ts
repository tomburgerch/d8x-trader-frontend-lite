const mapCurrencyToFractionDigits: Record<string, number> = {
  USD: 2,
  MATIC: 3,
  BTC: 5,
  ETH: 5,
};

export function formatToCurrency(value: number | undefined, currency = 'USD', fractionDigits?: number) {
  if (value === undefined) {
    return '-';
  }
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits || mapCurrencyToFractionDigits[currency],
  }).format(value)} ${currency}`;
}
