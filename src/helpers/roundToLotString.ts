import { countDecimalsOf } from './countDecimalsOf';

/**
 * Round a number to a given lot size and return a string formatted
 * to for this lot-size
 * @param x number to round
 * @param lot lot size (could be 'uneven' such as 0.019999999 instead of 0.02)
 * @param precisionOrig optional lot size precision (e.g. if 0.01999 should be 0.02 then precision could be 5)
 * @returns formatted number string
 */
export function roundToLotString(x: number, lot: number, precisionOrig?: number): string {
  const precision = precisionOrig === void 0 ? 7 : precisionOrig;

  // round lot to precision
  const lotRounded = Math.round(lot / Math.pow(10, -precision)) * Math.pow(10, -precision);
  const v = Math.round(x / lotRounded) * lotRounded;
  // number of digits of rounded lot
  const numDig = countDecimalsOf(lotRounded, precision);
  return v.toFixed(numDig);
}
