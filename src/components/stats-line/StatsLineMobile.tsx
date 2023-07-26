import { memo } from 'react';

import { Box, Typography } from '@mui/material';

import { ReactComponent as ChartLineIcon } from 'assets/icons/chartLineIcon.svg';

import type { StatDataI } from './types';

import styles from './StatsLine.module.scss';

interface StatsLinePropsI {
  items: StatDataI[];
}

export const StatsLineMobile = memo(({ items }: StatsLinePropsI) => (
  <Box className={styles.rootMobile}>
    <Box key={items[0].id} className={styles.statContainer}>
      <Box>
        <Typography variant="bodyTiny" className={styles.statLabel}>
          {items[0].label}
        </Typography>
        <Typography variant="bodyLarge" className={styles.statValue}>
          {items[0].value}
        </Typography>
      </Box>
      <Box>
        <ChartLineIcon />
      </Box>
    </Box>

    <Box key="grouped-stats" className={styles.statContainer}>
      <Box key="column-1">
        {items
          .filter((item) => item.columnNr === 1)
          .map((item) => (
            <Box key={item.id} className={styles.groupedStat}>
              <Typography variant="bodyTiny" className={styles.statLabel}>
                {item.label}
              </Typography>
              <Typography variant="bodyLarge" className={styles.statValue}>
                {item.value}
              </Typography>
            </Box>
          ))}
      </Box>
      <Box key="column-2">
        {items
          .filter((item) => item.columnNr === 2)
          .map((item) => (
            <Box key={item.id} className={styles.groupedStat}>
              <Typography variant="bodyTiny" className={styles.statLabel}>
                {item.label}
              </Typography>
              <Typography variant="bodyLarge" className={styles.statValue}>
                {item.value}
              </Typography>
            </Box>
          ))}
      </Box>
    </Box>
  </Box>
));
