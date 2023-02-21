import classNames from 'classnames';
import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Button, ButtonGroup } from '@mui/material';

import { stopLossAtom } from 'store/order-block.store';
import { StopLossE } from 'types/enums';

import styles from './StopLossSelector.module.scss';

export const StopLossSelector = memo(() => {
  const [stopLoss, setStopLoss] = useAtom(stopLossAtom);

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>Stop loss</Box>
      <Box className={styles.stopLossOptions}>
        <ButtonGroup variant="outlined" aria-label="button group">
          {Object.values(StopLossE).map((key) => (
            <Button
              key={key}
              variant="outlined"
              className={classNames({ [styles.selected]: key === stopLoss })}
              onClick={() => setStopLoss(key)}
            >
              {key}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </Box>
  );
});
