const mapSlippage: Record<number, number> = {
  1: 0.001,
  2: 0.005,
  3: 0.01,
  4: 0.015,
  5: 0.02,
  6: 0.03,
  7: 0.04,
  8: 0.05,
};

export function mapSlippageToNumber(slippage: number) {
  return mapSlippage[slippage];
}
