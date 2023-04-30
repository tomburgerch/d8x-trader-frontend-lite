/**
 * 9 are rounded up regardless of precision, e.g, 0.1899000 at precision 6 results in 3
 * @param x
 * @param precision
 * @returns number of decimals
 */
export function countDecimalsOf(x: number, precision?: number) {
  const decimalPart = x - Math.floor(x);
  if (decimalPart === 0) {
    return 0;
  }
  let decimalPartStr = decimalPart.toFixed(precision);
  // remove trailing zeros
  let c = decimalPartStr.charAt(decimalPartStr.length - 1);
  while (c === '0') {
    decimalPartStr = decimalPartStr.substring(0, decimalPartStr.length - 1);
    c = decimalPartStr.charAt(decimalPartStr.length - 1);
  }
  // remove trailing 9
  c = decimalPartStr.charAt(decimalPartStr.length - 1);
  while (c === '9') {
    decimalPartStr = decimalPartStr.substring(0, decimalPartStr.length - 1);
    c = decimalPartStr.charAt(decimalPartStr.length - 1);
  }
  return decimalPartStr.length > 2 ? decimalPartStr.length - 2 : 0;
}
