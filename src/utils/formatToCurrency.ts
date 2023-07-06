const mapCurrencyToFractionDigits: Record<string, number> = {
  USD: 2,
  MATIC: 3,
  dMATIC: 3,
  BTC: 5,
  dBTC: 5,
  ETH: 5,
  dETH: 5,
};

export function formatToCurrency(
  value: number | undefined | null,
  currency = 'USD',
  keepZeros = false,
  fractionDigits?: number
) {
  if (value == null) {
    return '-';
  }
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: fractionDigits || mapCurrencyToFractionDigits[currency],
    minimumFractionDigits: keepZeros ? fractionDigits || mapCurrencyToFractionDigits[currency] : undefined,
  }).format(value)} ${currency}`;
}
