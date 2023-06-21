import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChainId } from 'wagmi';

import { Box, Typography } from '@mui/material';

import { PERIOD_OF_7_DAYS } from 'app-constants';
import { getWeeklyAPI } from 'network/history';
import { formatToCurrency } from 'utils/formatToCurrency';
import { dCurrencyPriceAtom, tvlAtom, selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';
import { traderAPIAtom } from 'store/pools.store';

import styles from './GlobalStats.module.scss';

export const GlobalStats = () => {
  const chainId = useChainId();

  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [dCurrencyPrice, setDCurrencyPrice] = useAtom(dCurrencyPriceAtom);
  const [tvl, setTvl] = useAtom(tvlAtom);

  const [weeklyAPI, setWeeklyAPI] = useState<number>();

  const weeklyApiRequestSentRef = useRef(false);

  useEffect(() => {
    if (!chainId || !selectedLiquidityPool) {
      setWeeklyAPI(undefined);
      return;
    }

    if (weeklyApiRequestSentRef.current) {
      return;
    }

    const fromTimestamp = Date.now() - PERIOD_OF_7_DAYS;
    const toTimestamp = Date.now();

    weeklyApiRequestSentRef.current = true;
    getWeeklyAPI(chainId, fromTimestamp, toTimestamp, selectedLiquidityPool.poolSymbol)
      .then((data) => {
        setWeeklyAPI(data.apy * 100);
      })
      .finally(() => {
        weeklyApiRequestSentRef.current = false;
      });
  }, [chainId, selectedLiquidityPool]);

  useEffect(() => {
    setDCurrencyPrice(null);
    if (traderAPI && selectedLiquidityPool) {
      traderAPI.getShareTokenPrice(selectedLiquidityPool.poolSymbol).then((price) => setDCurrencyPrice(price));
    }
  }, [traderAPI, selectedLiquidityPool, setDCurrencyPrice]);

  useEffect(() => {
    setTvl(null);
    if (traderAPI && selectedLiquidityPool) {
      traderAPI
        .getPoolState(selectedLiquidityPool.poolSymbol)
        .then((PoolState) => setTvl(PoolState.pnlParticipantCashCC));
    }
  }, [traderAPI, selectedLiquidityPool, setTvl]);

  const dSupply = useMemo(() => {
    if (selectedLiquidityPool && dCurrencyPrice && tvl) {
      return formatToCurrency(tvl / dCurrencyPrice, `d${selectedLiquidityPool?.poolSymbol}`);
    }
    return '--';
  }, [selectedLiquidityPool, dCurrencyPrice, tvl]);

  return (
    <Box className={styles.root}>
      <Box key="midPrice" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          Weekly APY
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {weeklyAPI !== undefined ? formatToCurrency(weeklyAPI, '%') : '--'}
        </Typography>
      </Box>
      <Box key="markPrice" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          TVL
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {selectedLiquidityPool && tvl != null ? formatToCurrency(tvl, selectedLiquidityPool.poolSymbol) : '--'}
        </Typography>
      </Box>
      <Box key="indexPrice" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          d{selectedLiquidityPool?.poolSymbol} Price
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {dCurrencyPrice != null ? formatToCurrency(dCurrencyPrice, selectedLiquidityPool?.poolSymbol) : '--'}
        </Typography>
      </Box>
      <Box key="fundingRate" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          d{selectedLiquidityPool?.poolSymbol} Supply
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {dSupply}
        </Typography>
      </Box>
    </Box>
  );
};