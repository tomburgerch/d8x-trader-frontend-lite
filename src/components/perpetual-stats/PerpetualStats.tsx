import { useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import { formatToUSD } from 'utils/formatToUSD';

import { MOCK_PERPETUAL_STATS } from './mock';

import styles from './PerpetualStats.module.scss';

const perpetualStatsHeaders = ['Mid Price', 'Mark Price', 'Index Price', 'Funding Rate', 'Open Interest'];

export const PerpetualStats = () => {
  const perpetualStats = useMemo(() => MOCK_PERPETUAL_STATS, []);
  return (
    <Box className={styles.root}>
      {Object.values(perpetualStats)
        .slice(0, 3)
        .map((value: number, index) => (
          <Box key={value} className={styles.statContainer}>
            <Typography variant="bodySmall">{perpetualStatsHeaders[index]}</Typography>
            <Typography variant="bodySmall" className={styles.statValue}>
              {formatToUSD(value)}
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
