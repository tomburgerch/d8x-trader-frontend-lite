import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { useMediaQuery, useTheme } from '@mui/material';

import type { StatDataI } from 'components/stats-line/types';
import { StatsLine } from 'components/stats-line/StatsLine';
import { getWeeklyAPY } from 'network/history';
import { dCurrencyPriceAtom, sdkConnectedAtom, triggerUserStatsUpdateAtom, tvlAtom } from 'store/vault-pools.store';
import { collateralToSettleConversionAtom, selectedPoolAtom, traderAPIAtom } from 'store/pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';
import { getEnabledChainId } from 'utils/getEnabledChainId';

import styles from './GlobalStats.module.scss';

export const GlobalStats = () => {
  const { t } = useTranslation();

  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { chainId } = useAccount();

  const selectedPool = useAtomValue(selectedPoolAtom);
  const traderAPI = useAtomValue(traderAPIAtom);
  const triggerUserStatsUpdate = useAtomValue(triggerUserStatsUpdateAtom);
  const isSDKConnected = useAtomValue(sdkConnectedAtom);
  const c2s = useAtomValue(collateralToSettleConversionAtom);
  const [dCurrencyPrice, setDCurrencyPrice] = useAtom(dCurrencyPriceAtom);
  const [tvl, setTvl] = useAtom(tvlAtom);

  const [weeklyAPI, setWeeklyAPI] = useState<number>();

  const weeklyApiRequestSentRef = useRef(false);

  useEffect(() => {
    if (!selectedPool?.poolSymbol) {
      setWeeklyAPI(undefined);
      return;
    }

    if (weeklyApiRequestSentRef.current) {
      return;
    }

    weeklyApiRequestSentRef.current = true;
    getWeeklyAPY(getEnabledChainId(chainId), selectedPool.poolSymbol)
      .then((data) => {
        setWeeklyAPI(data.allTimeAPY * 100);
      })
      .catch((error) => {
        console.error(error);
        setWeeklyAPI(undefined);
      })
      .finally(() => {
        weeklyApiRequestSentRef.current = false;
      });
  }, [chainId, selectedPool?.poolSymbol, triggerUserStatsUpdate]);

  useEffect(() => {
    setDCurrencyPrice(null);
    if (traderAPI && isSDKConnected && selectedPool?.poolSymbol) {
      traderAPI.getShareTokenPrice(selectedPool.poolSymbol).then(setDCurrencyPrice);
    }
  }, [traderAPI, selectedPool?.poolSymbol, triggerUserStatsUpdate, isSDKConnected, setDCurrencyPrice]);

  useEffect(() => {
    setTvl(null);
    if (traderAPI && isSDKConnected && selectedPool?.poolSymbol) {
      traderAPI.getPoolState(selectedPool.poolSymbol).then((PoolState) => setTvl(PoolState.pnlParticipantCashCC));
    }
  }, [traderAPI, selectedPool?.poolSymbol, triggerUserStatsUpdate, isSDKConnected, setTvl]);

  const getDSupply = useCallback(
    (justNumber: boolean) => {
      if (selectedPool?.settleSymbol && dCurrencyPrice && tvl) {
        return formatToCurrency(tvl / dCurrencyPrice, `d${selectedPool.settleSymbol}`, true, undefined, justNumber);
      }
      return '--';
    },
    [selectedPool?.settleSymbol, dCurrencyPrice, tvl]
  );

  const weeklyAPY: StatDataI = useMemo(
    () => ({
      id: 'weeklyAPY',
      label: t('pages.vault.global-stats.apy'),
      value: weeklyAPI !== undefined ? formatToCurrency(weeklyAPI, '%', true, 2) : '--',
      numberOnly: weeklyAPI !== undefined ? formatToCurrency(weeklyAPI, '', true, 2) : '--',
      currencyOnly: weeklyAPI !== undefined ? '%' : '',
    }),
    [weeklyAPI, t]
  );

  const items: StatDataI[] = useMemo(
    () => [
      {
        id: 'tvl',
        label: t('pages.vault.global-stats.tvl'),
        value:
          selectedPool && tvl != null
            ? formatToCurrency(tvl * (c2s.get(selectedPool.poolSymbol)?.value ?? 1), selectedPool.settleSymbol, true)
            : '--',
        numberOnly:
          tvl != null && selectedPool
            ? formatToCurrency(tvl * (c2s.get(selectedPool.poolSymbol)?.value ?? 1), '', true)
            : '--',
        currencyOnly: selectedPool && tvl != null ? selectedPool.settleSymbol : '',
      },
      {
        id: 'dSymbolPrice',
        label: t('pages.vault.global-stats.price', { poolSymbol: selectedPool?.settleSymbol }),
        value:
          dCurrencyPrice != null && selectedPool
            ? formatToCurrency(
                dCurrencyPrice * (c2s.get(selectedPool.poolSymbol)?.value ?? 1),
                selectedPool.settleSymbol,
                true
              )
            : '--',
        numberOnly:
          dCurrencyPrice != null && selectedPool
            ? formatToCurrency(dCurrencyPrice * (c2s.get(selectedPool.poolSymbol)?.value ?? 1), '', true)
            : '--',
        currencyOnly: dCurrencyPrice != null ? selectedPool?.settleSymbol : '',
      },
      {
        id: 'dSymbolSupply',
        label: t('pages.vault.global-stats.supply', { poolSymbol: selectedPool?.settleSymbol }),
        value: getDSupply(true),
        numberOnly: getDSupply(true),
      },
    ],
    [selectedPool, tvl, dCurrencyPrice, c2s, getDSupply, t]
  );

  if (isMobileScreen) {
    return (
      <div className={styles.statContainer}>
        <div>
          <div className={styles.statMainLabel}>{weeklyAPY.label}</div>
          <span className={styles.statMainValue}>{weeklyAPY.numberOnly}</span>{' '}
          <span className={styles.statValue}>{weeklyAPY.currencyOnly}</span>
        </div>
        <div className={styles.statsBlock}>
          {items.map((item) => (
            <div key={item.id}>
              <div className={styles.statLabel}>{item.label}</div>
              <span className={styles.statValue}>{item.numberOnly}</span>{' '}
              <span className={styles.statCurrency}>{item.currencyOnly}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <StatsLine items={[weeklyAPY, ...items]} />;
};
