import { useAtom } from 'jotai';
import { memo, useMemo } from 'react';

import { Box, Typography } from '@mui/material';

import { orderInfoAtom, orderSizeAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom, selectedPerpetualAtom } from 'store/pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './InfoBlock.module.scss';

export const InfoBlock = memo(() => {
  const [orderInfo] = useAtom(orderInfoAtom);
  const [orderSize] = useAtom(orderSizeAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [selectedPerpetual] = useAtom(selectedPerpetualAtom);

  const feeInCC = useMemo(() => {
    if (!orderInfo?.tradingFee || !selectedPerpetual?.collToQuoteIndexPrice || !selectedPerpetual?.indexPrice) {
      return undefined;
    }
    return (
      (orderSize * orderInfo.tradingFee * selectedPerpetual.indexPrice) / selectedPerpetual.collToQuoteIndexPrice / 1e4
    );
  }, [orderSize, orderInfo, selectedPerpetual]);

  return (
    <Box className={styles.root}>
      <Box className={styles.row}>
        <Typography variant="body2">Order size</Typography>
        <Typography variant="body2">{formatToCurrency(orderSize, perpetualStatistics?.baseCurrency)}</Typography>
      </Box>
      <Box className={styles.row}>
        <Typography variant="body2">Fees</Typography>
        <Typography variant="body2">
          {formatToCurrency(feeInCC, perpetualStatistics?.poolName)} {'('}
          {formatToCurrency(orderInfo?.tradingFee, 'bps', 1)}
          {')'}
        </Typography>
      </Box>
    </Box>
  );
});
