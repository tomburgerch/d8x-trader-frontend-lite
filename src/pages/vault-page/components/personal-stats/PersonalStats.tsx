import { format } from 'date-fns';
import { useAtom } from 'jotai';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Box, Typography } from '@mui/material';

import { PERIOD_OF_2_DAYS, PERIOD_OF_4_DAYS } from 'app-constants';
import { getEarnings } from 'network/history';
import { formatToCurrency } from 'utils/formatToCurrency';
import { selectedPoolAtom, traderAPIAtom } from 'store/pools.store';
import { loadStatsAtom, sdkConnectedAtom, userAmountAtom, withdrawalsAtom } from 'store/vault-pools.store';

import styles from './PersonalStats.module.scss';

export const PersonalStats = memo(() => {
  const chainId = useChainId();
  const { address } = useAccount();

  const [selectedPool] = useAtom(selectedPoolAtom);
  const [withdrawals] = useAtom(withdrawalsAtom);
  const [userAmount, setUserAmount] = useAtom(userAmountAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [loadStats] = useAtom(loadStatsAtom);
  const [isSDKConnected] = useAtom(sdkConnectedAtom);

  const [estimatedEarnings, setEstimatedEarnings] = useState<number>();

  const earningsRequestSentRef = useRef(false);

  useEffect(() => {
    if (!loadStats) {
      return;
    }

    setUserAmount(null);
    if (selectedPool && traderAPI && isSDKConnected && address) {
      traderAPI.getPoolShareTokenBalance(address, selectedPool.poolSymbol).then((amount) => {
        setUserAmount(amount);
      });
    }
  }, [selectedPool, traderAPI, isSDKConnected, address, loadStats, setUserAmount]);

  useEffect(() => {
    if (!loadStats) {
      return;
    }

    if (!chainId || !selectedPool || !address) {
      setEstimatedEarnings(undefined);
      return;
    }

    if (earningsRequestSentRef.current) {
      return;
    }

    earningsRequestSentRef.current = true;

    getEarnings(chainId, address, selectedPool.poolSymbol)
      .then(({ earnings }) => setEstimatedEarnings(earnings))
      .finally(() => {
        earningsRequestSentRef.current = false;
      });
  }, [chainId, address, selectedPool, loadStats]);

  const withdrawnOn = useMemo(() => {
    if (!withdrawals || withdrawals.length === 0) {
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
      <Typography variant="h5" className={styles.heading}>
        Your stats
      </Typography>
      <Box key="amount" className={styles.statContainer}>
        <Typography variant="bodyTiny" className={styles.statLabel}>
          Amount
        </Typography>
        <Typography variant="bodyMedium" className={styles.statValue}>
          {userAmount !== undefined ? formatToCurrency(userAmount, `d${selectedPool?.poolSymbol}`) : '--'}
        </Typography>
      </Box>
      <Box key="midPrice" className={styles.statContainer}>
        <Typography variant="bodyTiny" className={styles.statLabel}>
          Estimated earnings
        </Typography>
        <Typography variant="bodyMedium" className={styles.statValue}>
          {estimatedEarnings !== undefined ? formatToCurrency(estimatedEarnings, selectedPool?.poolSymbol) : '--'}
        </Typography>
      </Box>
      <Box key="markPrice" className={styles.statContainer}>
        <Typography variant="bodyTiny" className={styles.statLabel}>
          Withdrawal initiated?
        </Typography>
        <Typography variant="bodyMedium" className={styles.statValue}>
          {withdrawals && withdrawals.length > 0 ? 'Yes' : 'No'}
        </Typography>
      </Box>
      <Box key="indexPrice" className={styles.statContainer}>
        <Typography variant="bodyTiny" className={styles.statLabel}>
          Withdrawal Amount
        </Typography>
        <Typography variant="bodyMedium" className={styles.statValue}>
          {withdrawals && withdrawals.length > 0
            ? formatToCurrency(withdrawals[withdrawals.length - 1].shareAmount, 'dMATIC')
            : 'na'}
        </Typography>
      </Box>
      <Box key="fundingRate" className={styles.statContainer}>
        <Typography variant="bodyTiny" className={styles.statLabel}>
          Can be withdrawn on
        </Typography>
        <Typography variant="bodyMedium" className={styles.statValue}>
          {withdrawnOn}
        </Typography>
      </Box>
    </Box>
  );
});
