import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Typography } from '@mui/material';

import { orderSizeAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom } from 'store/pools.store';

import styles from './InfoBlock.module.scss';

export const InfoBlock = memo(() => {
  const [orderSize] = useAtom(orderSizeAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

  return (
    <Box className={styles.root}>
      <Box className={styles.row}>
        <Typography variant="body2">Order size</Typography>
        <Typography variant="body2">
          {orderSize} {perpetualStatistics?.baseCurrency}
        </Typography>
      </Box>
      <Box className={styles.row}>
        <Typography variant="body2">Collateral</Typography>
        <Typography variant="body2">2 000 {perpetualStatistics?.poolName}</Typography>
      </Box>
      <Box className={styles.row}>
        <Typography variant="body2">Fees</Typography>
        <Typography variant="body2">2 {perpetualStatistics?.poolName}</Typography>
      </Box>
    </Box>
  );
});
