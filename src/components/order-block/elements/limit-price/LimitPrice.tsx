import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback } from 'react';

import { Box, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { limitPriceAtom, orderTypeAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom } from 'store/pools.store';
import { OrderTypeE } from 'types/enums';

import styles from './LimitPrice.module.scss';

export const LimitPrice = memo(() => {
  const [orderType] = useAtom(orderTypeAtom);
  const [limitPrice, setLimitPrice] = useAtom(limitPriceAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

  const handleLimitPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLimitPrice(event.target.value);
    },
    [setLimitPrice]
  );

  if (orderType === OrderTypeE.Market) {
    return null;
  }

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>
        <InfoBlock
          title="Limit price"
          content={
            <>
              <Typography>
                If you specify a limit price your order will be executed at the predetermined limit price or a better
                price.
              </Typography>
              <Typography>
                For stop order, setting a limit price is optional. A stop order with specified limit price is a
                stop-limit order, a stop order without specified limit price is a stop-market order.
              </Typography>
            </>
          }
        />
        Limit Price
      </Box>
      <OutlinedInput
        id="limit-size"
        endAdornment={
          <InputAdornment position="end">
            <Typography variant="adornment">{perpetualStatistics?.quoteCurrency}</Typography>
          </InputAdornment>
        }
        inputProps={{ step: 1, min: -1 }}
        type="number"
        placeholder="-"
        onChange={handleLimitPriceChange}
        value={limitPrice === null ? '' : limitPrice}
      />
    </Box>
  );
});
