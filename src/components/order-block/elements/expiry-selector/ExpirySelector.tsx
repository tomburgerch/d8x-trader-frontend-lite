import classNames from 'classnames';
import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Button, ButtonGroup, Typography } from '@mui/material';

import { InfoBlock } from 'components/info-block/InfoBlock';
import { expireDaysAtom, orderTypeAtom } from 'store/order-block.store';
import { ExpiryE, OrderTypeE } from 'types/enums';

import styles from './ExpirySelector.module.scss';

export const ExpirySelector = memo(() => {
  const [orderType] = useAtom(orderTypeAtom);
  const [expireDays, setExpireDays] = useAtom(expireDaysAtom);

  if (orderType === OrderTypeE.Market) {
    return null;
  }

  return (
    <Box className={styles.root}>
      <Box className={styles.label}>
        <InfoBlock
          title="Expiry"
          content={<Typography>Number of days after which your order will expire.</Typography>}
        />
      </Box>
      <Box className={styles.expiryOptions}>
        <ButtonGroup variant="outlined" aria-label="button group">
          {Object.values(ExpiryE).map((key) => (
            <Button
              key={key}
              variant="outlined"
              className={classNames({ [styles.selected]: key === expireDays })}
              onClick={() => setExpireDays(key)}
            >
              {key}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </Box>
  );
});
