import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Box, Typography } from '@mui/material';

import { PERIOD_OF_2_DAYS, PERIOD_OF_4_DAYS } from 'app-constants';
import { getEarnings } from 'network/history';
import { formatToCurrency } from 'utils/formatToCurrency';
import { selectedLiquidityPoolAtom, userAmountAtom, withdrawalsAtom } from 'store/liquidity-pools.store';
import { traderAPIAtom } from 'store/pools.store';

import styles from './PersonalStats.module.scss';

export const PersonalStats = memo(() => {
  const chainId = useChainId();
  const { address } = useAccount();

  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);
  const [withdrawals] = useAtom(withdrawalsAtom);
  const [userAmount, setUserAmount] = useAtom(userAmountAtom);
  const [traderAPI] = useAtom(traderAPIAtom);

  const [estimatedEarnings, setEstimatedEarnings] = useState<number>();

  const earningsRequestSentRef = useRef(false);

  useEffect(() => {
    setUserAmount(null);
    if (selectedLiquidityPool && traderAPI && address) {
      traderAPI.getPoolShareTokenBalance(address, selectedLiquidityPool.poolSymbol).then((amount) => {
        setUserAmount(amount);
      });
    }
  }, [selectedLiquidityPool, traderAPI, address, setUserAmount]);

  useEffect(() => {
    if (!chainId || !selectedLiquidityPool || !address) {
      setEstimatedEarnings(undefined);
      return;
    }

    if (earningsRequestSentRef.current) {
      return;
    }

    earningsRequestSentRef.current = true;

    getEarnings(chainId, address, selectedLiquidityPool.poolSymbol)
      .then(({ earnings }) => setEstimatedEarnings(earnings))
      .finally(() => {
        earningsRequestSentRef.current = false;
      });
  }, [chainId, address, selectedLiquidityPool]);

  const withdrawnOn = useMemo(() => {
    if (withdrawals.length === 0) {
      return 'na';
    }
    const currentTime = Date.now();
    const latestWithdrawalTimeElapsed = withdrawals[withdrawals.length - 1].timeElapsedSec * 1000;

    const withdrawalTime = currentTime + PERIOD_OF_2_DAYS - latestWithdrawalTimeElapsed;
    if (currentTime < withdrawalTime) {
      return format(new Date(withdrawalTime), 'MMMM d yyyy HH:mm');
    } else if (currentTime >= withdrawalTime + PERIOD_OF_4_DAYS) {
      return 'Overdue';
    } else {
      // (currentTime >= withdrawalTime)
      return 'Now';
    }
  }, [withdrawals]);

  return (
    <Box className={styles.root}>
      <Typography variant="h4">Your stats</Typography>
      <Box className={styles.stats}>
        <Box className={styles.statsLeftBlock}>
          <Box key="amount" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Amount
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {userAmount !== undefined ? formatToCurrency(userAmount, `d${selectedLiquidityPool?.poolSymbol}`) : '--'}
            </Typography>
          </Box>
          <Box key="midPrice" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Estimated earnings
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {estimatedEarnings !== undefined ? formatToCurrency(estimatedEarnings, '%') : '--'}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.statsRightBlock}>
          <Box key="markPrice" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Withdrawal initiated?
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {withdrawals.length > 0 ? 'Yes' : 'No'}
            </Typography>
          </Box>
          <Box key="indexPrice" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Withdrawal Amount
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {withdrawals.length > 0
                ? formatToCurrency(withdrawals[withdrawals.length - 1].shareAmount, 'dMATIC')
                : 'na'}
            </Typography>
          </Box>
          <Box key="fundingRate" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Can be withdrawn on
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {withdrawnOn}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
