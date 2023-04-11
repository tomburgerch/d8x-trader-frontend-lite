import { roundToLotString } from '@d8x/perpetuals-sdk';
import { useAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';

import { Box, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { orderSizeAtom } from 'store/order-block.store';
import { perpetualStaticInfoAtom, perpetualStatisticsAtom } from 'store/pools.store';

import styles from './OrderSize.module.scss';

export const OrderSize = memo(() => {
  const [orderSize, setOrderSize] = useAtom(orderSizeAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [perpetualStaticInfo] = useAtom(perpetualStaticInfoAtom);

  const handleInputCapture = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setOrderSize(+event.target.value);
    },
    [setOrderSize]
  );

  const handleInputBlur = useCallback(() => {
    if (perpetualStaticInfo) {
      setOrderSize(+roundToLotString(orderSize, perpetualStaticInfo.lotSizeBC));
    }
  }, [perpetualStaticInfo, orderSize, setOrderSize]);

  const orderSizeStep = useMemo(() => {
    if (perpetualStaticInfo) {
      return roundToLotString(perpetualStaticInfo.lotSizeBC, perpetualStaticInfo.lotSizeBC);
    }
    return 0.1;
  }, [perpetualStaticInfo]);

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>
        <InfoBlock title="Order size" content={<Typography>Sets the size of your order.</Typography>} />
      </Box>
      <OutlinedInput
        id="order-size"
        endAdornment={
          <InputAdornment position="end">
            <Typography variant="adornment">{perpetualStatistics?.baseCurrency}</Typography>
          </InputAdornment>
        }
        type="number"
        inputProps={{ step: orderSizeStep, min: 0 }}
        value={orderSize}
        onChange={handleInputCapture}
        onBlur={handleInputBlur}
      />
    </Box>
  );
});
