import { TraderInterface } from '@d8x/perpetuals-sdk';
import { atom } from 'jotai';
import { Address } from 'viem';

import { getEarnings } from 'network/history';
import { poolsAtom, traderAPIAtom } from 'store/pools.store';
import { OpenTraderRebateI, OverviewPoolItemI, PoolWithIdI } from 'types/types';

import { fetchPoolTokensUSDBalanceAtom } from './fetchPoolTokensUSDBalance';
import { fetchRealizedPnLAtom } from './fetchRealizedPnL';
import { fetchUnrealizedPnLAtom } from './fetchUnrealizedPnLAtom';

const getPoolUsdPrice = async (traderAPI: TraderInterface, pool: PoolWithIdI) => {
  const info = await traderAPI.getPriceInUSD(
    `${pool.perpetuals[0].baseCurrency}-${pool.perpetuals[0].quoteCurrency}-${pool.poolSymbol}`
  );
  const priceInUsd = info.get(`${pool.perpetuals[0].baseCurrency}-USD`);
  if (priceInUsd) {
    const quotePrice = priceInUsd / pool.perpetuals[0].indexPrice;
    return { collateral: pool.perpetuals[0].collToQuoteIndexPrice * quotePrice, quote: quotePrice };
  }
  return { collateral: 0, quote: 0 };
};

const getBaseUSDPrice = async (traderAPI: TraderInterface, pool: PoolWithIdI) => {
  const basePricesMap: Record<string, number> = {};

  for (const perpetual of pool.perpetuals) {
    const info = await traderAPI.getPriceInUSD(
      `${perpetual.baseCurrency}-${perpetual.quoteCurrency}-${pool.poolSymbol}`
    );
    basePricesMap[perpetual.baseCurrency] = info.get(`${perpetual.baseCurrency}-USD`) || 0;
  }
  return basePricesMap;
};

interface PoolUsdPriceI {
  collateral: number;
  quote: number;
  bases: Record<string, number>;
}
export const poolUsdPriceAtom = atom<Record<string, PoolUsdPriceI>>({});
const isLoadingAtom = atom(true);
export const totalOpenRewardsAtom = atom<number>(0);
export const poolShareTokensUSDBalanceAtom = atom(0);
interface TokenPoolSharePercentI {
  symbol: string;
  balance: number;
  percent: number;
}
export const poolShareTokensShareAtom = atom<TokenPoolSharePercentI[]>([]);
export const totalEstimatedEarningsAtom = atom(0);
export const accountValueAtom = atom(0);

export const fetchPositionsAtom = atom(
  (get) => ({ isLoading: get(isLoadingAtom) }),
  async (get, set, userAddress: Address, chainId: number, openRewards: OpenTraderRebateI[]) => {
    const pools = get(poolsAtom);
    const traderAPI = get(traderAPIAtom);
    if (!traderAPI) return;

    const openRewardsByPools: OverviewPoolItemI[] = [];

    const poolUsdPriceMap: Record<string, PoolUsdPriceI> = {};
    const dCurrencyPriceMap: Record<string, number> = {};
    const poolShareTokenBalances: { symbol: string; balance: number }[] = [];

    let totalEstimatedEarnings = 0;

    for (const pool of pools) {
      const poolUSDPrice = await getPoolUsdPrice(traderAPI, pool);
      const baseUSDPrice = await getBaseUSDPrice(traderAPI, pool);
      poolUsdPriceMap[pool.poolSymbol] = {
        collateral: poolUSDPrice.collateral,
        quote: poolUSDPrice.quote,
        bases: baseUSDPrice,
      };

      const openRewardsAmount = openRewards
        .filter((volume) => volume.poolId === pool.poolId)
        .reduce((accumulator, currentValue) => accumulator + currentValue.amountCC, 0);

      openRewardsByPools.push({ poolSymbol: pool.poolSymbol, value: openRewardsAmount * poolUSDPrice.collateral });

      const earnings = await getEarnings(chainId, userAddress, pool.poolSymbol);
      totalEstimatedEarnings += earnings.earnings;

      dCurrencyPriceMap[pool.poolSymbol] = await traderAPI.getShareTokenPrice(pool.poolSymbol);
      const poolShareBalance = await traderAPI.getPoolShareTokenBalance(userAddress, pool.poolSymbol);
      poolShareTokenBalances.push({
        symbol: pool.poolSymbol,
        balance: poolShareBalance * dCurrencyPriceMap[pool.poolSymbol],
      });
    }
    set(poolUsdPriceAtom, poolUsdPriceMap);
    const totalReferralRewards = openRewardsByPools.reduce((acc, curr) => acc + Number(curr.value), 0);
    set(totalOpenRewardsAtom, totalReferralRewards);
    set(totalEstimatedEarningsAtom, totalEstimatedEarnings);

    const poolShareTokensUSDBalance = poolShareTokenBalances.reduce(
      (acc, balance) => acc + balance.balance * poolUsdPriceMap[balance.symbol].collateral,
      0
    );
    set(
      poolShareTokensShareAtom,
      poolShareTokenBalances.map((balance) => ({
        symbol: balance.symbol,
        balance: balance.balance,
        percent: (balance.balance * poolUsdPriceMap[balance.symbol].collateral) / poolShareTokensUSDBalance || 0,
      }))
    );
    set(poolShareTokensUSDBalanceAtom, poolShareTokensUSDBalance);

    const [unrealizedPnL, , poolTokensUSDBalance] = await Promise.all([
      set(fetchUnrealizedPnLAtom, userAddress, chainId),
      set(fetchRealizedPnLAtom, userAddress, chainId),
      set(fetchPoolTokensUSDBalanceAtom, userAddress),
    ]);

    let totalCollateralCC = 0;
    let totalUnrealizedPnl = 0;
    if (unrealizedPnL) {
      totalCollateralCC = unrealizedPnL.totalCollateralCC;
      totalUnrealizedPnl = unrealizedPnL.totalUnrealizedPnl;
    }

    const accountValue =
      poolTokensUSDBalance + totalCollateralCC + totalUnrealizedPnl + poolShareTokensUSDBalance + totalReferralRewards;

    set(accountValueAtom, accountValue);
    set(isLoadingAtom, false);
  }
);
