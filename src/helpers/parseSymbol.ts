export function parseSymbol(symbol: string) {
  const parts = symbol.split('-'); // baseCurrency-quoteCurrency-poolSymbol
  if (parts.length === 3) {
    return {
      baseCurrency: parts[0],
      quoteCurrency: parts[0],
      poolSymbol: parts[0],
    };
  }
  return null;
}
