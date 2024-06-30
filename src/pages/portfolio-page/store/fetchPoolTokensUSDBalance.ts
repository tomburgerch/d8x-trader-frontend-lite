import { multicall } from '@wagmi/core';
import { atom } from 'jotai';
import { type Address, erc20Abi } from 'viem';

import { collateralToSettleConversionAtom, poolsAtom } from 'store/pools.store';

import { poolUsdPriceAtom } from './fetchPortfolio';
import { wagmiConfig } from 'blockchain-api/wagmi/wagmiClient';

export const poolTokensUSDBalanceAtom = atom(0);
export const fetchPoolTokensUSDBalanceAtom = atom(null, async (get, set, userAddress: Address) => {
  const pools = get(poolsAtom);
  const poolUsdPrice = get(poolUsdPriceAtom);
  const c2s = get(collateralToSettleConversionAtom);

  const [poolTokensBalances, poolTokensDecimals] = await Promise.all([
    multicall(wagmiConfig, {
      contracts: pools.map((pool) => ({
        address: pool.settleTokenAddr as Address, // @DONE: settlement token (converted to usd anyway)
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
      })),
    }),
    multicall(wagmiConfig, {
      contracts: pools.map((pool) => ({
        address: pool.settleTokenAddr as Address,
        abi: erc20Abi,
        functionName: 'decimals',
      })),
    }),
  ]);

  const poolTokensUSDBalance = poolTokensBalances.reduce((acc, balance, index) => {
    if (balance.result && poolTokensDecimals[index].result) {
      // eslint-disable-next-line
      // @ts-ignore
      const tokenBalance = Number(balance.result) / 10 ** poolTokensDecimals[index].result;
      const px = c2s.get(pools[index].poolSymbol)?.value ?? 1;
      return acc + (tokenBalance / px) * poolUsdPrice[pools[index].poolSymbol].collateral; // SC to CC to USD
    }
    return acc;
  }, 0);
  set(poolTokensUSDBalanceAtom, poolTokensUSDBalance);
  return poolTokensUSDBalance;
});
