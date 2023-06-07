// import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Typography } from '@mui/material';

import { formatToCurrency } from 'utils/formatToCurrency';
// import { selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';

import styles from './PersonalStats.module.scss';
import { format } from 'date-fns';

export const PersonalStats = memo(() => {
  // const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);

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
              {formatToCurrency(987654.11, 'dMATIC')}
            </Typography>
          </Box>
          <Box key="midPrice" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Estimated earnings
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {formatToCurrency(112.22, '%')}
            </Typography>
          </Box>
        </Box>
        <Box className={styles.statsRightBlock}>
          <Box key="markPrice" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Withdrawal initiated?
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              Yes
            </Typography>
          </Box>
          <Box key="indexPrice" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Withdrawal Amount
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {formatToCurrency(21212121.32, 'dMATIC')}
            </Typography>
          </Box>
          <Box key="fundingRate" className={styles.statContainer}>
            <Typography variant="bodySmall" className={styles.statLabel}>
              Can be withdrawn on
            </Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {format(new Date(), 'MMMM d yyyy HH:mm')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
