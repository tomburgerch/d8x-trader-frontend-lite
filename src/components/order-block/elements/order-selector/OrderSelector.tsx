import { useAtom } from 'jotai';
import classNames from 'classnames';
import { memo } from 'react';

import { Box, Button, CardHeader } from '@mui/material';

import { orderBlockAtom } from 'store/order-block.store';
import { OrderBlockE } from 'types/enums';

import styles from './OrderSelector.module.scss';

export const OrderSelector = memo(() => {
  const [orderBlock, setOrderBlock] = useAtom(orderBlockAtom);

  return (
    <CardHeader
      title={
        <Box className={styles.rootOptions}>
          {Object.values(OrderBlockE).map((key) => (
            <Button
              key={key}
              className={classNames({ [styles.selected]: key === orderBlock })}
              onClick={() => setOrderBlock(key)}
            >
              {key}
            </Button>
          ))}
        </Box>
      }
      className={styles.root}
    />
  );
});
