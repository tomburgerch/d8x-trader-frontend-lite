import { useAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { memo, useCallback } from 'react';

import { Box, InputAdornment, OutlinedInput } from '@mui/material';

import { orderSizeAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom } from 'store/pools.store';

import styles from './OrderSize.module.scss';

export const OrderSize = memo(() => {
  const [orderSize, setOrderSize] = useAtom(orderSizeAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

  const handleInputCapture = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setOrderSize(+event.target.value);
    },
    [setOrderSize]
  );

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>Order Size</Box>
      <OutlinedInput
        id="order-size"
        endAdornment={<InputAdornment position="end">{perpetualStatistics?.baseCurrency}</InputAdornment>}
        type="number"
        inputProps={{ step: 0.1, min: 0 }}
        defaultValue={orderSize}
        onChange={handleInputCapture}
      />
    </Box>
  );
});
