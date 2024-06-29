import { useAtomValue } from 'jotai';
import { useCallback } from 'react';

import { poolsAtom } from 'store/pools.store';

export const useSettlementMap = () => {
  const pools = useAtomValue(poolsAtom);

  const mapPoolSymbolToSettleSymbol = useCallback(
    (poolSymbol: string | undefined) => {
      if (!poolSymbol) {
        return '';
      }
      const foundPool = pools.find((pool) => pool.poolSymbol.toUpperCase() === poolSymbol.toUpperCase());
      if (foundPool) {
        return foundPool.settleSymbol.toUpperCase() || poolSymbol.toUpperCase();
      }
      return poolSymbol.toUpperCase();
    },
    [pools]
  );

  return {
    mapPoolSymbolToSettleSymbol,
  };
};
