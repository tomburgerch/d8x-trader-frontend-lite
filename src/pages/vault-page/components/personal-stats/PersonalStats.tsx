import { useAtom } from 'jotai';
import { memo, useEffect, useRef, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Box, Typography } from '@mui/material';

import { getEarnings } from 'network/history';

import { selectedPoolAtom, traderAPIAtom } from 'store/pools.store';
import { triggerUserStatsUpdateAtom, sdkConnectedAtom, userAmountAtom, withdrawalsAtom } from 'store/vault-pools.store';

import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './PersonalStats.module.scss';

interface PersonalStatsPropsI {
  withdrawOn: string;
}

export const PersonalStats = memo(({ withdrawOn }: PersonalStatsPropsI) => {
  const chainId = useChainId();
  const { address } = useAccount();

  const [selectedPool] = useAtom(selectedPoolAtom);
  const [withdrawals] = useAtom(withdrawalsAtom);
  const [userAmount, setUserAmount] = useAtom(userAmountAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [triggerUserStatsUpdate] = useAtom(triggerUserStatsUpdateAtom);
  const [isSDKConnected] = useAtom(sdkConnectedAtom);

  const [estimatedEarnings, setEstimatedEarnings] = useState<number>();

  const earningsRequestSentRef = useRef(false);

  useEffect(() => {
    setUserAmount(null);
    if (selectedPool && traderAPI && isSDKConnected && address) {
      traderAPI.getPoolShareTokenBalance(address, selectedPool.poolSymbol).then((amount) => {
        setUserAmount(amount);
      });
    }
  }, [selectedPool, traderAPI, isSDKConnected, address, triggerUserStatsUpdate, setUserAmount]);

  useEffect(() => {
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
      .catch(console.error)
      .finally(() => {
        earningsRequestSentRef.current = false;
      });
  }, [chainId, address, selectedPool, triggerUserStatsUpdate]);

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
          {estimatedEarnings !== undefined
            ? formatToCurrency(
                estimatedEarnings < -0.0000000001 ? estimatedEarnings : Math.max(estimatedEarnings, 0),
                selectedPool?.poolSymbol,
                false,
                10
              )
            : '--'}
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
            ? formatToCurrency(withdrawals[withdrawals.length - 1].shareAmount, `d${selectedPool?.poolSymbol}`)
            : 'N/A'}
        </Typography>
      </Box>
      <Box key="fundingRate" className={styles.statContainer}>
        <Typography variant="bodyTiny" className={styles.statLabel}>
          Can be withdrawn on
        </Typography>
        <Typography variant="bodyMedium" className={styles.statValue}>
          {withdrawOn}
        </Typography>
      </Box>
    </Box>
  );
});
