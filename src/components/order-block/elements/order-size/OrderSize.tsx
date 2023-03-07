import { useAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { memo, useCallback } from 'react';

import { Box, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
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
      <Box className={styles.label}>
        <InfoBlock title="Order size" content={<Typography>Sets the size of your order.</Typography>} />
        Order Size
      </Box>
      <OutlinedInput
        id="order-size"
        endAdornment={
          <InputAdornment position="end">
            <Typography variant="adornment">{perpetualStatistics?.baseCurrency}</Typography>
          </InputAdornment>
        }
        type="number"
        inputProps={{ step: 0.1, min: 0 }}
        defaultValue={orderSize}
        onChange={handleInputCapture}
      />
    </Box>
  );
});
