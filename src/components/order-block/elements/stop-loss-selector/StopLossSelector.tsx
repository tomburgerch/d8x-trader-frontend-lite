import classNames from 'classnames';
import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { stopLossAtom } from 'store/order-block.store';
import { StopLossE } from 'types/enums';

import styles from './StopLossSelector.module.scss';

export const StopLossSelector = memo(() => {
  const [stopLoss, setStopLoss] = useAtom(stopLossAtom);

  return (
    <Box className={styles.root}>
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
                order, you are specifying a stop-market SELL order). The trigger price is automatically calculated such
                that your overall loss is as per your selection, assuming you entered at the worst price your slippage
                settings allow.
              </Typography>
            </>
          }
        />
      </Box>
      <Box className={styles.stopLossOptions}>
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
      </Box>
    </Box>
  );
});
