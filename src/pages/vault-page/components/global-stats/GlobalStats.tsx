import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChainId } from 'wagmi';

import { PERIOD_OF_7_DAYS } from 'app-constants';
import type { StatDataI } from 'components/stats-line/types';
import { StatsLine } from 'components/stats-line/StatsLine';
import { getWeeklyAPI } from 'network/history';
import { formatToCurrency } from 'utils/formatToCurrency';
import { selectedPoolAtom, traderAPIAtom } from 'store/pools.store';
import { dCurrencyPriceAtom, tvlAtom, loadStatsAtom, sdkConnectedAtom } from 'store/vault-pools.store';

export const GlobalStats = () => {
  const chainId = useChainId();

  const [selectedPool] = useAtom(selectedPoolAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [dCurrencyPrice, setDCurrencyPrice] = useAtom(dCurrencyPriceAtom);
  const [tvl, setTvl] = useAtom(tvlAtom);
  const [loadStats] = useAtom(loadStatsAtom);
  const [isSDKConnected] = useAtom(sdkConnectedAtom);

  const [weeklyAPI, setWeeklyAPI] = useState<number>();

  const weeklyApiRequestSentRef = useRef(false);

  useEffect(() => {
    if (!loadStats) {
      return;
    }

    if (!chainId || !selectedPool) {
      setWeeklyAPI(undefined);
      return;
    }

    if (weeklyApiRequestSentRef.current) {
      return;
    }

    const fromTimestamp = Math.floor((Date.now() - PERIOD_OF_7_DAYS) / 1000);
    const toTimestamp = Math.floor(Date.now() / 1000);

    weeklyApiRequestSentRef.current = true;
    getWeeklyAPI(chainId, fromTimestamp, toTimestamp, selectedPool.poolSymbol)
      .then((data) => {
        setWeeklyAPI(data.apy * 100);
      })
      .finally(() => {
        weeklyApiRequestSentRef.current = false;
      });
  }, [chainId, selectedPool, loadStats]);

  useEffect(() => {
    if (!loadStats) {
      return;
    }
    setDCurrencyPrice(null);
    if (traderAPI && isSDKConnected && selectedPool) {
      traderAPI.getShareTokenPrice(selectedPool.poolSymbol).then((price) => setDCurrencyPrice(price));
    }
  }, [traderAPI, selectedPool, loadStats, isSDKConnected, setDCurrencyPrice]);

  useEffect(() => {
    if (!loadStats) {
      return;
    }
    setTvl(null);
    if (traderAPI && isSDKConnected && selectedPool) {
      traderAPI.getPoolState(selectedPool.poolSymbol).then((PoolState) => setTvl(PoolState.pnlParticipantCashCC));
    }
  }, [traderAPI, selectedPool, loadStats, isSDKConnected, setTvl]);

  const dSupply = useMemo(() => {
    if (selectedPool && dCurrencyPrice && tvl) {
      return formatToCurrency(tvl / dCurrencyPrice, `d${selectedPool?.poolSymbol}`, true);
    }
    return '--';
  }, [selectedPool, dCurrencyPrice, tvl]);

  const items: StatDataI[] = useMemo(
    () => [
      {
        id: 'weeklyAPY',
        label: 'Weekly APY',
        value: weeklyAPI !== undefined ? formatToCurrency(weeklyAPI, '%', true, 2) : '--',
      },
      {
        id: 'tvl',
        label: 'TVL',
        value: selectedPool && tvl != null ? formatToCurrency(tvl, selectedPool.poolSymbol, true) : '--',
      },
      {
        id: 'dSymbolPrice',
        label: `d${selectedPool?.poolSymbol} Price`,
        value: dCurrencyPrice != null ? formatToCurrency(dCurrencyPrice, selectedPool?.poolSymbol, true) : '--',
      },
      {
        id: 'dSymbolSupply',
        label: `d${selectedPool?.poolSymbol} Supply`,
        value: dSupply,
      },
    ],
    [weeklyAPI, selectedPool, tvl, dCurrencyPrice, dSupply]
  );

  return <StatsLine items={items} />;
};
