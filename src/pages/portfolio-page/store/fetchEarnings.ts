import { atom } from 'jotai';
import { Address } from 'viem';

import { getEarnings } from 'network/history';
import { poolsAtom } from 'store/pools.store';

export const totalEstimatedEarningsAtom = atom(0);
export const fetchEarningsAtom = atom(null, async (get, set, userAddress: Address, chainId: number) => {
  const pools = get(poolsAtom);

  const earningsPromises = [];
  for (const pool of pools) {
    earningsPromises.push(getEarnings(chainId, userAddress, pool.poolSymbol));
  }
  const earningsArray = await Promise.all(earningsPromises);
  const totalEstimatedEarnings = earningsArray.reduce((acc, curr) => acc + curr.earnings, 0);

  set(totalEstimatedEarningsAtom, totalEstimatedEarnings);
});
