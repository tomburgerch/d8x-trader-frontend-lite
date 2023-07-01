import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback } from 'react';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { limitPriceAtom, orderTypeAtom } from 'store/order-block.store';
import { selectedPerpetualAtom } from 'store/pools.store';
import { OrderTypeE } from 'types/enums';
import { ReactComponent as DecreaseIcon } from 'assets/icons/decreaseIcon.svg';
import { ReactComponent as IncreaseIcon } from 'assets/icons/increaseIcon.svg';

import styles from './LimitPrice.module.scss';

export const LimitPrice = memo(() => {
  const [orderType] = useAtom(orderTypeAtom);
  const [limitPrice, setLimitPrice] = useAtom(limitPriceAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);

  const handleLimitPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLimitPrice(event.target.value);
    },
    [setLimitPrice]
  );

  const handleDecreasePrice = () => {
    let newPrice;
    if (limitPrice) {
      newPrice = (limitPrice - 1).toString();
    } else {
      newPrice = '0';
    }
    setLimitPrice(newPrice);
  };

  const handleIncreasePrice = () => {
    let newPrice;
    if (limitPrice) {
      newPrice = (limitPrice + 1).toString();
    } else {
      newPrice = '1';
    }
    setLimitPrice(newPrice);
  };

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
                For a stop order, setting a limit price is optional. A stop order with specified limit price is a
                stop-limit order, a stop order without specified limit price is a stop-market order.
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
          disabled={limitPrice === 0}
        >
          <DecreaseIcon />
        </Button>
        <OutlinedInput
          id="limit-size"
          endAdornment={
            <InputAdornment position="end">
              <Typography variant="adornment">{selectedPerpetual?.quoteCurrency}</Typography>
            </InputAdornment>
          }
          inputProps={{ step: 1, min: -1 }}
          type="number"
          placeholder="-"
          onChange={handleLimitPriceChange}
          value={limitPrice === null ? '' : limitPrice}
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
