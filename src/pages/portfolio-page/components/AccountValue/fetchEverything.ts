import { TraderInterface } from '@d8x/perpetuals-sdk';
import { multicall } from '@wagmi/core';
import { atom } from 'jotai';
import { poolsAtom, traderAPIAtom } from 'store/pools.store';
import { OpenTraderRebateI, OverviewPoolItemI, PoolWithIdI } from 'types/types';
import { Address } from 'viem';
import { erc20ABI } from 'wagmi';

const getPoolUsdPrice = async (traderAPI: TraderInterface, pool: PoolWithIdI) => {
  // TODO: Bug for USDC pool, returns MATIC-USD while perpetuals[0] looks for MATIC-USDC
  const info = await traderAPI.getPriceInUSD(
    `${pool.perpetuals[0].baseCurrency}-${pool.perpetuals[0].quoteCurrency}-${pool.poolSymbol}`
  );
  const priceInUsd = info.get('MATIC-USD');
  // const priceInUsd = info.get(`${pool.perpetuals[0].baseCurrency}-${pool.perpetuals[0].quoteCurrency}`);
  if (priceInUsd) {
    return priceInUsd / pool.perpetuals[0].indexPrice;
  }
  return 0;
};

const collateralPriceInUSDAtom = atom<Record<string, number>>({});
const isLoadingAtom = atom(true);
const openRewardsAtom = atom<OverviewPoolItemI[]>([]);
export const poolTokensUSDBalanceAtom = atom(0);
export const poolShareTokensUSDBalanceAtom = atom(0);
interface TokenPoolSharePercentI {
  symbol: string;
  balance: number;
  percent: number;
}
export const poolShareTokensShareAtom = atom<TokenPoolSharePercentI[]>([]);
export const fetchPositionsAtom = atom(
  (get) => ({ isLoading: get(isLoadingAtom), openRewardsByPools: get(openRewardsAtom) }),
  async (get, set, userAddress: Address, openRewards: OpenTraderRebateI[]) => {
    const pools = get(poolsAtom);
    const traderAPI = get(traderAPIAtom);
    if (!traderAPI) return;

    const openRewardsByPools: OverviewPoolItemI[] = [];

    const poolUsdPriceMap: Record<string, number> = {};
    const dCurrencyPriceMap: Record<string, number> = {};
    const poolShareTokenBalances: { symbol: string; balance: number }[] = [];

    for (const pool of pools) {
      const collateralPriceInUSD = await getPoolUsdPrice(traderAPI, pool);
      poolUsdPriceMap[pool.poolSymbol] = collateralPriceInUSD;

      const openRewardsAmount = openRewards
        .filter((volume) => volume.poolId === pool.poolId)
        .reduce((accumulator, currentValue) => accumulator + currentValue.amountCC, 0);

      openRewardsByPools.push({ poolSymbol: pool.poolSymbol, value: openRewardsAmount * collateralPriceInUSD });

      dCurrencyPriceMap[pool.poolSymbol] = await traderAPI.getShareTokenPrice(pool.poolSymbol);
      const poolShareBalance = await traderAPI.getPoolShareTokenBalance(userAddress, pool.poolSymbol);
      poolShareTokenBalances.push({
        symbol: pool.poolSymbol,
        balance: poolShareBalance * dCurrencyPriceMap[pool.poolSymbol],
      });
    }
    set(collateralPriceInUSDAtom, poolUsdPriceMap);
    set(openRewardsAtom, openRewardsByPools);

    const poolShareTokensUSDBalance = poolShareTokenBalances.reduce(
      (acc, balance) => acc + balance.balance * poolUsdPriceMap[balance.symbol],
      0
    );
    set(
      poolShareTokensShareAtom,
      poolShareTokenBalances.map((balance) => ({
        symbol: balance.symbol,
        balance: balance.balance,
        percent: (balance.balance * poolUsdPriceMap[balance.symbol]) / poolShareTokensUSDBalance || 0,
      }))
    );
    set(poolShareTokensUSDBalanceAtom, poolShareTokensUSDBalance);

    const poolTokensBalances = await multicall({
      contracts: pools.map((pool) => ({
        address: pool.marginTokenAddr as Address,
        abi: erc20ABI,
        functionName: 'balanceOf',
        args: [userAddress as Address],
      })),
    });
    const poolTokensDecimals = await multicall({
      contracts: pools.map((pool) => ({
        address: pool.marginTokenAddr as Address,
        abi: erc20ABI,
        functionName: 'decimals',
      })),
    });

    set(
      poolTokensUSDBalanceAtom,
      poolTokensBalances.reduce((acc, balance, index) => {
        if (balance.result && poolTokensDecimals[index].result) {
          // eslint-disable-next-line
          // @ts-ignore
          const tokenBalance = Number(balance.result) / 10 ** poolTokensDecimals[index].result;
          return acc + tokenBalance * poolUsdPriceMap[pools[index].poolSymbol];
        }
        return acc;
      }, 0)
    );
    set(isLoadingAtom, false);
  }
);
