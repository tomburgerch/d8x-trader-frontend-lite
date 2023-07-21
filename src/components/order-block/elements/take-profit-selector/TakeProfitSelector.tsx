import classNames from 'classnames';
import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useEffect, useMemo } from 'react';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { orderInfoAtom, takeProfitAtom, takeProfitPriceAtom } from 'store/order-block.store';
import { selectedPerpetualAtom } from 'store/pools.store';
import { OrderBlockE, TakeProfitE } from 'types/enums';

import styles from './TakeProfitSelector.module.scss';

export const TakeProfitSelector = memo(() => {
  const [orderInfo] = useAtom(orderInfoAtom);
  const [takeProfit, setTakeProfit] = useAtom(takeProfitAtom);
  const [, setTakeProfitPrice] = useAtom(takeProfitPriceAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);

  const handleTakeProfitPriceChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const takeProfitPriceValue = event.target.value;
      if (takeProfitPriceValue !== '') {
        setTakeProfitPrice(+takeProfitPriceValue);
        setTakeProfit(null);
      } else {
        setTakeProfitPrice(null);
        setTakeProfit(TakeProfitE.None);
      }
    },
    [setTakeProfitPrice, setTakeProfit]
  );

  useEffect(() => {
    setTakeProfitPrice(null);
  }, [orderInfo?.orderBlock, setTakeProfitPrice]);

  const handleTakeProfitChange = useCallback(
    (takeProfitValue: TakeProfitE) => {
      setTakeProfitPrice(null);
      setTakeProfit(takeProfitValue);
    },
    [setTakeProfitPrice, setTakeProfit]
  );

  const minTakeProfitPrice = useMemo(() => {
    if (orderInfo?.midPrice && orderInfo.orderBlock === OrderBlockE.Long) {
      return orderInfo.midPrice;
    }
    return 0;
  }, [orderInfo?.midPrice, orderInfo?.orderBlock]);

  const maxTakeProfitPrice = useMemo(() => {
    if (orderInfo?.midPrice && orderInfo.orderBlock === OrderBlockE.Short) {
      return orderInfo.midPrice;
    }
    return undefined;
  }, [orderInfo?.midPrice, orderInfo?.orderBlock]);

  const takeProfitValue = useMemo(() => {
    if (orderInfo?.takeProfitPrice != null) {
      const minValue = Math.max(minTakeProfitPrice, orderInfo.takeProfitPrice);
      if (maxTakeProfitPrice) {
        return Math.min(maxTakeProfitPrice, minValue);
      }
      return minValue;
    }
    return '';
  }, [orderInfo?.takeProfitPrice, minTakeProfitPrice, maxTakeProfitPrice]);

  return (
    <Box className={styles.root}>
      <Box className={styles.labelHolder}>
        <Box className={styles.label}>
          <InfoBlock
            title="Take profit"
            content={
              <>
                <Typography>You can specify a take profit order to go along with your main order.</Typography>
                <Typography>
                  If you select e.g., 100%, you create a second order, that will be triggered if your profit on your
                  main order reaches 100%.
                </Typography>
                <Typography>
                  Technically, you are specifying a limit order of the opposing side (if your main order is a BUY order,
                  you are specifying a limit SELL order). The limit price is automatically calculated such that your
                  overall profit is as per your selection, assuming you entered at the worst price your slippage
                  settings allow.
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
          value={takeProfitValue}
          placeholder="-"
          onChange={handleTakeProfitPriceChange}
          inputProps={{ step: 0.01, min: minTakeProfitPrice, max: maxTakeProfitPrice }}
        />
      </Box>
      <Box className={styles.takeProfitOptions}>
        {Object.values(TakeProfitE).map((key) => (
          <Button
            key={key}
            variant="outlined"
            className={classNames({ [styles.selected]: key === takeProfit })}
            onClick={() => handleTakeProfitChange(key)}
          >
            {key}
          </Button>
        ))}
      </Box>
    </Box>
  );
});
