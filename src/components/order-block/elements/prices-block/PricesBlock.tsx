import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback } from 'react';

import { Box, InputAdornment, OutlinedInput } from '@mui/material';

import { limitPriceAtom, orderTypeAtom, triggerPriceAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom } from 'store/pools.store';
import { OrderTypeE } from 'types/enums';

import styles from './PricesBlock.module.scss';

export const PricesBlock = memo(() => {
  const [orderType] = useAtom(orderTypeAtom);
  const [triggerPrice, setTriggerPrice] = useAtom(triggerPriceAtom);
  const [limitPrice, setLimitPrice] = useAtom(limitPriceAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

  const handleTriggerPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTriggerPrice(+event.target.value);
    },
    [setTriggerPrice]
  );

  const handleLimitPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLimitPrice(+event.target.value);
    },
    [setLimitPrice]
  );

  if (orderType === OrderTypeE.Market) {
    return null;
  }

  return (
    <Box className={styles.root}>
      <Box className={styles.triggerPrice}>
        {orderType === OrderTypeE.Stop && (
          <>
            <Box className={styles.label}>Trigger Price</Box>
            <OutlinedInput
              id="order-size"
              endAdornment={<InputAdornment position="end">{perpetualStatistics?.quoteCurrency}</InputAdornment>}
              inputProps={{ step: 1, min: 0 }}
              type="number"
              defaultValue={triggerPrice}
              onChange={handleTriggerPriceChange}
            />
          </>
        )}
      </Box>
      <Box className={styles.limitPrice}>
        <Box className={styles.label}>Limit Price</Box>
        <OutlinedInput
          id="order-size"
          endAdornment={<InputAdornment position="end">{perpetualStatistics?.quoteCurrency}</InputAdornment>}
          inputProps={{ step: 1, min: 0 }}
          type="number"
          defaultValue={limitPrice}
          onChange={handleLimitPriceChange}
        />
      </Box>
    </Box>
  );
});
