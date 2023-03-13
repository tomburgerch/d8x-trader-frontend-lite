import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback } from 'react';

import { Box, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { orderTypeAtom, triggerPriceAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom } from 'store/pools.store';
import { OrderTypeE } from 'types/enums';

import styles from './TriggerPrice.module.scss';
import { InfoBlock } from '../../../info-block/InfoBlock';

export const TriggerPrice = memo(() => {
  const [orderType] = useAtom(orderTypeAtom);
  const [triggerPrice, setTriggerPrice] = useAtom(triggerPriceAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

  const handleTriggerPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setTriggerPrice(+event.target.value);
    },
    [setTriggerPrice]
  );

  if (orderType !== OrderTypeE.Stop) {
    return null;
  }

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>
        <InfoBlock
          title="Trigger price"
          content={
            <>
              <Typography>The trigger price is the price at which your stop order is triggered.</Typography>
              <Typography>
                If you do not select a limit price in addition to your trigger price (stop-market order), your order
                will be executed at the best available price once triggered.
              </Typography>
              <Typography>
                If you specify a limit price in addition to your trigger price (stop-limit order), your order will be
                executed at the predetermined limit price or a better price.
              </Typography>
            </>
          }
        />
      </Box>
      <OutlinedInput
        id="trigger-size"
        endAdornment={
          <InputAdornment position="end">
            <Typography variant="adornment">{perpetualStatistics?.quoteCurrency}</Typography>
          </InputAdornment>
        }
        inputProps={{ step: 1, min: 0 }}
        type="number"
        defaultValue={triggerPrice}
        onChange={handleTriggerPriceChange}
      />
    </Box>
  );
});
