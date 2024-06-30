import { atom } from 'jotai';
import { type Address } from 'viem';

import { poolsAtom, traderAPIAtom } from 'store/pools.store';

import { poolUsdPriceAtom } from './fetchPortfolio';
import type { PoolShareTokenBalanceI } from '../types/types';

interface TokenPoolSharePercentI {
  symbol: string;
  settleSymbol: string;
  balance: number;
  percent: number;
}

export const poolShareTokensShareAtom = atom<TokenPoolSharePercentI[]>([]);
export const poolShareTokensUSDBalanceAtom = atom(0);

export const fetchPoolShareAtom = atom(null, async (get, set, userAddress: Address) => {
  const traderAPI = get(traderAPIAtom);
  if (!traderAPI) {
    return;
  }

  const pools = get(poolsAtom);
  const poolUsdPrice = get(poolUsdPriceAtom);

  const dCurrencyPriceMap: Record<string, number> = {};
  const poolShareTokenBalances: PoolShareTokenBalanceI[] = [];

  for (const pool of pools) {
    dCurrencyPriceMap[pool.poolSymbol] = await traderAPI.getShareTokenPrice(pool.poolSymbol);
    const poolShareBalance = await traderAPI.getPoolShareTokenBalance(userAddress, pool.poolSymbol);
    poolShareTokenBalances.push({
      symbol: pool.poolSymbol,
      settleSymbol: pool.settleSymbol,
      balance: poolShareBalance * dCurrencyPriceMap[pool.poolSymbol],
    });
  }

  const poolShareTokensUSDBalance = poolShareTokenBalances.reduce(
    (acc, balance) => acc + balance.balance * poolUsdPrice[balance.symbol].collateral,
    0
  );
  set(poolShareTokensUSDBalanceAtom, poolShareTokensUSDBalance);
  set(
    poolShareTokensShareAtom,
    poolShareTokenBalances.map((balance) => ({
      symbol: balance.symbol,
      settleSymbol: balance.settleSymbol,
      balance: balance.balance,
      percent: (balance.balance * poolUsdPrice[balance.symbol].collateral) / poolShareTokensUSDBalance || 0,
    }))
  );

  return poolShareTokensUSDBalance;
});
