import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback } from 'react';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { orderTypeAtom, triggerPriceAtom } from 'store/order-block.store';
import { selectedPerpetualAtom } from 'store/pools.store';
import { OrderTypeE } from 'types/enums';
import { ReactComponent as DecreaseIcon } from 'assets/icons/decreaseIcon.svg';
import { ReactComponent as IncreaseIcon } from 'assets/icons/increaseIcon.svg';

import styles from './TriggerPrice.module.scss';
import { InfoBlock } from '../../../info-block/InfoBlock';

export const TriggerPrice = memo(() => {
  const [orderType] = useAtom(orderTypeAtom);
  const [triggerPrice, setTriggerPrice] = useAtom(triggerPriceAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);

  const handleTriggerPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const targetValue = event.target.value;
      if (targetValue) {
        setTriggerPrice(targetValue);
      }
    },
    [setTriggerPrice]
  );

  const handleDecreasePrice = () => {
    let newPrice;
    if (triggerPrice) {
      newPrice = (triggerPrice - 1).toString();
    } else {
      newPrice = '0';
    }
    setTriggerPrice(newPrice);
  };

  const handleIncreasePrice = () => {
    let newPrice;
    if (triggerPrice) {
      newPrice = (triggerPrice + 1).toString();
    } else {
      newPrice = '1';
    }
    setTriggerPrice(newPrice);
  };

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
              <Typography>The trigger price is the mark price at which your stop order is triggered.</Typography>
              <Typography>
                If you do not select a limit price in addition to your trigger price, you would be placing a stop-market
                order. Your order will be executed at the best available price once triggered.
              </Typography>
              <Typography>
                If you specify a limit price in addition to your trigger price, you would be placing a stop-limit order.
                Your order will be executed at the predetermined limit price or a better price.
              </Typography>
            </>
          }
        />
      </Box>
      <Box className={styles.inputHolder}>
        <Button
          key="decrease-order-size"
          variant="outlined"
          size="small"
          className={styles.decreaseButton}
          onClick={handleDecreasePrice}
          disabled={triggerPrice === 0}
        >
          <DecreaseIcon />
        </Button>
        <OutlinedInput
          id="trigger-size"
          endAdornment={
            <InputAdornment position="end">
              <Typography variant="adornment">{selectedPerpetual?.quoteCurrency}</Typography>
            </InputAdornment>
          }
          inputProps={{ step: 1, min: 0 }}
          type="number"
          onChange={handleTriggerPriceChange}
          value={triggerPrice === null ? '' : triggerPrice}
        />
        <Button
          key="increase-order-size"
          variant="outlined"
          size="small"
          className={styles.increaseButton}
          onClick={handleIncreasePrice}
        >
          <IncreaseIcon />
        </Button>
      </Box>
    </Box>
  );
});
