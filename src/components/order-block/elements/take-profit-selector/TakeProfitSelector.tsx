import classNames from 'classnames';
import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Button, ButtonGroup } from '@mui/material';

import { takeProfitAtom } from 'store/order-block.store';
import { TakeProfitE } from 'types/enums';

import styles from './TakeProfitSelector.module.scss';

export const TakeProfitSelector = memo(() => {
  const [takeProfit, setTakeProfit] = useAtom(takeProfitAtom);

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>Take profit</Box>
      <Box className={styles.takeProfitOptions}>
        <ButtonGroup variant="outlined" aria-label="button group">
          {Object.values(TakeProfitE).map((key) => (
            <Button
              key={key}
              variant="outlined"
              className={classNames({ [styles.selected]: key === takeProfit })}
              onClick={() => setTakeProfit(key)}
            >
              {key}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </Box>
  );
});
