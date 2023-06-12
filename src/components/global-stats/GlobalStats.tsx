import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChainId } from 'wagmi';

import { Box, Typography } from '@mui/material';

import { getWeeklyAPI } from 'network/history';
import { formatToCurrency } from 'utils/formatToCurrency';
import { selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';
import { traderAPIAtom } from 'store/pools.store';

import styles from './GlobalStats.module.scss';

const PERIOD_OF_7_DAYS = 7 * 24 * 60 * 60 * 1000;

export const GlobalStats = () => {
  const chainId = useChainId();

  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);
  const [traderAPI] = useAtom(traderAPIAtom);

  const [weeklyAPI, setWeeklyAPI] = useState<number>();
  const [dPrice, setDPrice] = useState<number>();

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
    if (traderAPI && selectedLiquidityPool) {
      traderAPI.getShareTokenPrice(selectedLiquidityPool.poolSymbol).then((price: number) => setDPrice(price));
    } else {
      setDPrice(undefined);
    }
  }, [traderAPI, selectedLiquidityPool]);

  const dSupply = useMemo(() => {
    if (selectedLiquidityPool && dPrice) {
      return formatToCurrency(
        selectedLiquidityPool.pnlParticipantCashCC / dPrice,
        `d${selectedLiquidityPool?.poolSymbol}`
      );
    }
    return '--';
  }, [selectedLiquidityPool, dPrice]);

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
          {selectedLiquidityPool
            ? formatToCurrency(selectedLiquidityPool.pnlParticipantCashCC, selectedLiquidityPool.poolSymbol)
            : '--'}
        </Typography>
      </Box>
      <Box key="indexPrice" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          d{selectedLiquidityPool?.poolSymbol} Price
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {dPrice !== undefined ? formatToCurrency(dPrice, selectedLiquidityPool?.poolSymbol) : '--'}
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
