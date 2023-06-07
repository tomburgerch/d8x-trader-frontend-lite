import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useState } from 'react';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { Separator } from 'components/separator/Separator';
import { InfoBlock } from 'components/info-block/InfoBlock';
import { selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';

import styles from './InitiateAction.module.scss';
import { formatToCurrency } from '../../../../utils/formatToCurrency';
import { format } from 'date-fns';

export const InitiateAction = memo(() => {
  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);

  const [initiateAmount, setInitiateAmount] = useState(0);

  const handleInputCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInitiateAmount(+event.target.value);
  }, []);

  const handleInitiateLiquidity = useCallback(() => {
    console.log('Initiate liquidity:', initiateAmount);
  }, [initiateAmount]);

  return (
    <div className={styles.root}>
      <Separator />
      <Box className={styles.inputLine}>
        <Box className={styles.label}>
          <InfoBlock
            title="Amount"
            content={
              <>
                <Typography>Some text goes here for Initiate Amount.</Typography>
                <Typography>More text goes here...</Typography>
              </>
            }
          />
        </Box>
        <OutlinedInput
          id="initiate-amount-size"
          endAdornment={
            <InputAdornment position="end">
              <Typography variant="adornment">{selectedLiquidityPool?.poolSymbol}</Typography>
            </InputAdornment>
          }
          type="number"
          inputProps={{ step: 1, min: 0 }}
          value={initiateAmount}
          onChange={handleInputCapture}
        />
      </Box>
      <Separator />
      <Box className={styles.infoBlock}>
        <Box className={styles.row}>
          <Typography variant="body2">Amount</Typography>
          <Typography variant="body2">{formatToCurrency(1222333, selectedLiquidityPool?.poolSymbol)}</Typography>
        </Box>
        <Box className={styles.row}>
          <Typography variant="body2">Can be withdrawn on:</Typography>
          <Typography variant="body2">{format(new Date(), 'MMMM d yyyy HH:mm')}</Typography>
        </Box>
      </Box>
      <Button
        variant="primary"
        disabled={!initiateAmount}
        onClick={handleInitiateLiquidity}
        className={styles.actionButton}
      >
        Initiate withdrawal
      </Button>
    </div>
  );
});
