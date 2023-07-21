import classNames from 'classnames';
import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useEffect, useMemo } from 'react';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { orderInfoAtom, stopLossAtom, stopLossPriceAtom } from 'store/order-block.store';
import { selectedPerpetualAtom } from 'store/pools.store';
import { OrderBlockE, StopLossE } from 'types/enums';

import styles from './StopLossSelector.module.scss';

export const StopLossSelector = memo(() => {
  const [orderInfo] = useAtom(orderInfoAtom);
  const [stopLoss, setStopLoss] = useAtom(stopLossAtom);
  const [, setStopLossPrice] = useAtom(stopLossPriceAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);

  useEffect(() => {
    setStopLossPrice(null);
  }, [orderInfo?.orderBlock, setStopLossPrice]);

  const handleStopLossPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const stopLossPriceValue = event.target.value;
      if (stopLossPriceValue !== '') {
        setStopLossPrice(+stopLossPriceValue);
        setStopLoss(null);
      } else {
        setStopLossPrice(null);
        setStopLoss(StopLossE.None);
      }
    },
    [setStopLossPrice, setStopLoss]
  );

  const handleStopLossChange = useCallback(
    (stopLossValue: StopLossE) => {
      setStopLossPrice(null);
      setStopLoss(stopLossValue);
    },
    [setStopLossPrice, setStopLoss]
  );

  const minStopLossPrice = useMemo(() => {
    if (orderInfo?.midPrice && orderInfo.orderBlock === OrderBlockE.Short) {
      return orderInfo.midPrice;
    } else if (orderInfo?.midPrice && orderInfo?.leverage) {
      return orderInfo.midPrice - orderInfo.midPrice / orderInfo.leverage;
    }
    return 0;
  }, [orderInfo?.midPrice, orderInfo?.orderBlock, orderInfo?.leverage]);

  const maxStopLossPrice = useMemo(() => {
    if (orderInfo?.midPrice && orderInfo.orderBlock === OrderBlockE.Long) {
      return orderInfo.midPrice;
    } else if (orderInfo?.midPrice && orderInfo?.leverage) {
      return orderInfo.midPrice + orderInfo.midPrice / orderInfo.leverage;
    }
  }, [orderInfo?.midPrice, orderInfo?.orderBlock, orderInfo?.leverage]);

  const stopLossValue = useMemo(() => {
    if (orderInfo?.stopLossPrice != null) {
      const minValue = Math.max(minStopLossPrice, orderInfo.stopLossPrice);
      if (maxStopLossPrice) {
        return Math.min(maxStopLossPrice, minValue);
      }
      return minValue;
    }
    return '';
  }, [orderInfo?.stopLossPrice, minStopLossPrice, maxStopLossPrice]);

  return (
    <Box className={styles.root}>
      <Box className={styles.labelHolder}>
        <Box className={styles.label}>
          <InfoBlock
            title="Stop loss"
            content={
              <>
                <Typography>You can specify a stop loss order to go along with your main order.</Typography>
                <Typography>
                  If you select e.g. -50%, you create a second order, that will be triggered if your loss on your main
                  order reaches -50%.
                </Typography>
                <Typography>
                  Technically, you are specifying a stop-market order, of the opposing side (if your main order is a BUY
                  order, you are specifying a stop-market SELL order). The trigger price is automatically calculated
                  such that your overall loss is as per your selection, assuming you entered at the worst price your
                  slippage settings allow.
                </Typography>
              </>
            }
          />
        </Box>
        <OutlinedInput
          id="custom-stop-loss-price"
          className={styles.customPriceInput}
          endAdornment={
            <InputAdornment position="end">
              <Typography variant="adornment">{selectedPerpetual?.quoteCurrency}</Typography>
            </InputAdornment>
          }
          type="number"
          value={stopLossValue}
          placeholder="-"
          onChange={handleStopLossPriceChange}
          inputProps={{ step: 0.01, min: minStopLossPrice, max: maxStopLossPrice }}
        />
      </Box>
      <Box className={styles.stopLossOptions}>
        {Object.values(StopLossE).map((key) => (
          <Button
            key={key}
            variant="outlined"
            className={classNames({ [styles.selected]: key === stopLoss })}
            onClick={() => handleStopLossChange(key)}
          >
            {key}
          </Button>
        ))}
      </Box>
    </Box>
  );
});
