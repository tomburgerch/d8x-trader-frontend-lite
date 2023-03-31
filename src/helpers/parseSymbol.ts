export function parseSymbol(symbol: string | undefined) {
  if (symbol !== undefined) {
    const parts = symbol.split('-'); // baseCurrency-quoteCurrency-poolSymbol
    if (parts.length === 3) {
      return {
        baseCurrency: parts[0],
        quoteCurrency: parts[1],
        poolSymbol: parts[2],
      };
    }
  }
  return null;
}
