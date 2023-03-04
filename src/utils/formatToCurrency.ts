const mapCurrencyToFractionDigits: Record<string, number> = {
  USD: 2,
  MATIC: 2,
  BTC: 5,
  ETH: 5,
};

export function formatToCurrency(value: number, currency = 'USD', fractionDigits?: number) {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits || mapCurrencyToFractionDigits[currency],
  }).format(value)} ${currency}`;
}
