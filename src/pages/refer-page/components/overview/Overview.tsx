import { Box, Typography } from '@mui/material';

import { type PoolI } from 'types/types';

import styles from './Overview.module.scss';

export interface OverviewItemI {
  title: string;
  value: number | string;
  poolSymbol: PoolI['poolSymbol'];
}

interface OverviewPropsI {
  title: string;
  items: OverviewItemI[];
}

export const Overview = ({ title, items }: OverviewPropsI) => {
  return (
    <Box className={styles.root}>
      <Typography variant="h5" className={styles.title}>
        {title}
      </Typography>
      <Box className={styles.dataBlock}>
        {items.map(({ title: itemTitle, value, poolSymbol }) => (
          <Box key={itemTitle}>
            <Typography variant="bodyTiny" component="p" className={styles.dataTitle}>
              {itemTitle}
            </Typography>
            <Typography variant="bodyMedium" className={styles.dataValue}>
              {value} {poolSymbol}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
