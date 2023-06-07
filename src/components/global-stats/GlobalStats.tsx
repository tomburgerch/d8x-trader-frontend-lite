// import { useAtom } from 'jotai';

import { Box, Typography } from '@mui/material';

import { formatToCurrency } from 'utils/formatToCurrency';
// import { selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';

import styles from './GlobalStats.module.scss';

export const GlobalStats = () => {
  // const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);

  return (
    <Box className={styles.root}>
      <Box key="midPrice" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          Weekly APY
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {formatToCurrency(112.22, '%')}
        </Typography>
      </Box>
      <Box key="markPrice" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          TVL
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {formatToCurrency(987654.11, 'dMATIC')}
        </Typography>
      </Box>
      <Box key="indexPrice" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          dMATIC Price
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {formatToCurrency(21212121.32, 'MATIC')}
        </Typography>
      </Box>
      <Box key="fundingRate" className={styles.statContainer}>
        <Typography variant="bodySmall" className={styles.statLabel}>
          dMATIC Supply
        </Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {formatToCurrency(12345.1, 'dMATIC')}
        </Typography>
      </Box>
    </Box>
  );
};
