import { BigNumber } from '@ethersproject/bignumber';

/**
 * Converts x into ABDK64x64 format
 * @param {number} x   number (float)
 * @returns {BigNumber} x^64 in big number format
 */

const ONE_64x64 = BigNumber.from('0x010000000000000000');

export function floatToABK64x64(xOrig: number) {
  // convert float to ABK64x64 bigint-format
  // Create string from number with 18 decimals
  if (xOrig === 0) {
    return BigNumber.from(0);
  }
  const sg = Math.sign(xOrig);
  const x = Math.abs(xOrig);
  const strX = Number(x).toFixed(18);
  const arrX = strX.split('.');
  const xInt = BigNumber.from(arrX[0]);
  const xDec = BigNumber.from(arrX[1]);
  const xIntBig = xInt.mul(ONE_64x64);
  const dec18 = BigNumber.from(10).pow(BigNumber.from(18));
  const xDecBig = xDec.mul(ONE_64x64).div(dec18);
  return xIntBig.add(xDecBig).mul(sg);
}
