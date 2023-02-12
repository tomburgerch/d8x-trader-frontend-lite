interface SymbolPropsI {
  baseCurrency: string;
  quoteCurrency: string;
  poolSymbol: string;
}

export function createSymbol({ baseCurrency, quoteCurrency, poolSymbol }: SymbolPropsI) {
  return `${baseCurrency}-${quoteCurrency}-${poolSymbol}`;
}
