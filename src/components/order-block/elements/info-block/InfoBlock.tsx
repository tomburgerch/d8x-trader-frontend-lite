import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Typography } from '@mui/material';

import { orderInfoAtom, orderSizeAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom } from 'store/pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './InfoBlock.module.scss';

export const InfoBlock = memo(() => {
  const [orderInfo] = useAtom(orderInfoAtom);
  const [orderSize] = useAtom(orderSizeAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

  return (
    <Box className={styles.root}>
      <Box className={styles.row}>
        <Typography variant="body2">Order size</Typography>
        <Typography variant="body2">{formatToCurrency(orderSize, perpetualStatistics?.baseCurrency)}</Typography>
      </Box>
      <Box className={styles.row}>
        <Typography variant="body2">Fees</Typography>
        <Typography variant="body2">
          {formatToCurrency(orderInfo?.tradingFee ?? 0, perpetualStatistics?.poolName, 6)}
        </Typography>
      </Box>
    </Box>
  );
});
