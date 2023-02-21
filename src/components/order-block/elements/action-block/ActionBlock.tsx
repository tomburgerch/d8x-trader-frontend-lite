import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Button } from '@mui/material';

import { orderBlockAtom, orderTypeAtom } from 'store/order-block.store';
import { OrderBlockE } from 'types/enums';

import styles from './ActionBlock.module.scss';

const orderBlockMap: Record<OrderBlockE, string> = {
  [OrderBlockE.Long]: 'Buy',
  [OrderBlockE.Short]: 'Sell',
};

export const ActionBlock = memo(() => {
  const [orderBlock] = useAtom(orderBlockAtom);
  const [orderType] = useAtom(orderTypeAtom);

  return (
    <Box className={styles.root}>
      <Button variant="action">
        {orderBlockMap[orderBlock]} {orderType.toLowerCase()}
      </Button>
    </Box>
  );
});
