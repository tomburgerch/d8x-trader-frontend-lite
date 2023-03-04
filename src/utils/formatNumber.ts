export function formatNumber(value: number, fractionDigits = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: fractionDigits }).format(value);
}
