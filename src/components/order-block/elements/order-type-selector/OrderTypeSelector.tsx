import classNames from 'classnames';
import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Button } from '@mui/material';

import { orderTypeAtom } from 'store/order-block.store';
import { OrderTypeE } from 'types/enums';

import styles from './OrderTypeSelector.module.scss';

export const OrderTypeSelector = memo(() => {
  const [orderType, setOrderType] = useAtom(orderTypeAtom);

  return (
    <Box className={styles.root}>
      {Object.values(OrderTypeE).map((key) => (
        <Button
          key={key}
          className={classNames({ [styles.selected]: key === orderType })}
          variant={key === orderType ? 'primary' : 'secondary'}
          size="small"
          onClick={() => setOrderType(key)}
        >
          {OrderTypeE[key]}
        </Button>
      ))}
    </Box>
  );
});
