import type { FC } from 'react';

import { Box, Typography } from '@mui/material';

import { MOCK_PERPETUAL_STATS } from './mock';

import styles from './PerpetualStats.module.scss';

const perpetualStatsHeaders = ['Mid Price', 'Mark Price', 'Index Price', 'Funding Rate', 'Open Interest'];

export const PerpetualStats: FC = () => {
  return (
    <Box className={styles.root}>
      {Object.values(MOCK_PERPETUAL_STATS)
        .slice(0, 3)
        .map((value: number, index) => (
          <Box key={value} className={styles.statContainer}>
            <Typography variant="bodySmall">{perpetualStatsHeaders[index]}</Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
            </Typography>
          </Box>
        ))}
      <Box className={styles.statContainer}>
        <Typography variant="bodySmall">{perpetualStatsHeaders[3]}</Typography>
        <Typography variant="bodySmall" className={styles.statValue}>{`${
          MOCK_PERPETUAL_STATS.fundingRate / 100
        }%`}</Typography>
      </Box>
      <Box className={styles.statContainer}>
        <Typography variant="bodySmall">{perpetualStatsHeaders[4]}</Typography>
        <Typography variant="bodySmall" className={styles.statValue}>
          {MOCK_PERPETUAL_STATS.openInterest} BTC
        </Typography>
      </Box>
    </Box>
  );
};
