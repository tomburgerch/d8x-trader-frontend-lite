import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChainId } from 'wagmi';

import type { StatDataI } from 'components/stats-line/types';
import { StatsLine } from 'components/stats-line/StatsLine';
import { getWeeklyAPI } from 'network/history';
import { formatToCurrency } from 'utils/formatToCurrency';
import { dCurrencyPriceAtom, tvlAtom, triggerUserStatsUpdateAtom, sdkConnectedAtom } from 'store/vault-pools.store';
import { selectedPoolAtom, traderAPIAtom } from 'store/pools.store';

export const GlobalStats = () => {
  const { t } = useTranslation();
  const chainId = useChainId();

  const [selectedPool] = useAtom(selectedPoolAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [dCurrencyPrice, setDCurrencyPrice] = useAtom(dCurrencyPriceAtom);
  const [tvl, setTvl] = useAtom(tvlAtom);
  const [triggerUserStatsUpdate] = useAtom(triggerUserStatsUpdateAtom);
  const [isSDKConnected] = useAtom(sdkConnectedAtom);

  const [weeklyAPI, setWeeklyAPI] = useState<number>();

  const weeklyApiRequestSentRef = useRef(false);

  useEffect(() => {
    if (!chainId || !selectedPool) {
      setWeeklyAPI(undefined);
      return;
    }

    if (weeklyApiRequestSentRef.current) {
      return;
    }

    weeklyApiRequestSentRef.current = true;
    getWeeklyAPI(chainId, selectedPool.poolSymbol)
      .then((data) => {
        setWeeklyAPI(data.allTimeAPY * 100);
      })
      .catch(console.error)
      .finally(() => {
        weeklyApiRequestSentRef.current = false;
      });
  }, [chainId, selectedPool, triggerUserStatsUpdate]);

  useEffect(() => {
    setDCurrencyPrice(null);
    if (traderAPI && isSDKConnected && selectedPool) {
      traderAPI.getShareTokenPrice(selectedPool.poolSymbol).then((price) => setDCurrencyPrice(price));
    }
  }, [traderAPI, selectedPool, triggerUserStatsUpdate, isSDKConnected, setDCurrencyPrice]);

  useEffect(() => {
    setTvl(null);
    if (traderAPI && isSDKConnected && selectedPool) {
      traderAPI.getPoolState(selectedPool.poolSymbol).then((PoolState) => setTvl(PoolState.pnlParticipantCashCC));
    }
  }, [traderAPI, selectedPool, triggerUserStatsUpdate, isSDKConnected, setTvl]);

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
        label: t('pages.vault.global-stats.apy'),
        value: weeklyAPI !== undefined ? formatToCurrency(weeklyAPI, '%', true, 2) : '--',
      },
      {
        id: 'tvl',
        label: t('pages.vault.global-stats.tvl'),
        value: selectedPool && tvl != null ? formatToCurrency(tvl, selectedPool.poolSymbol, true) : '--',
      },
      {
        id: 'dSymbolPrice',
        label: t('pages.vault.global-stats.price', { poolSymbol: selectedPool?.poolSymbol }),
        value: dCurrencyPrice != null ? formatToCurrency(dCurrencyPrice, selectedPool?.poolSymbol, true) : '--',
      },
      {
        id: 'dSymbolSupply',
        label: t('pages.vault.global-stats.supply', { poolSymbol: selectedPool?.poolSymbol }),
        value: dSupply,
      },
    ],
    [weeklyAPI, selectedPool, tvl, dCurrencyPrice, dSupply, t]
  );

  return <StatsLine items={items} />;
};
