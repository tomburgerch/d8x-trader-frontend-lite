import { useAtom } from 'jotai';
import { ChangeEvent, memo, useCallback, useState } from 'react';

import { Box, Button, InputAdornment, OutlinedInput, Typography } from '@mui/material';

import { Separator } from 'components/separator/Separator';
import { InfoBlock } from 'components/info-block/InfoBlock';
import { selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './AddAction.module.scss';

export const AddAction = memo(() => {
  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);

  const [addAmount, setAddAmount] = useState(0);

  const handleInputCapture = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAddAmount(+event.target.value);
  }, []);

  const handleAddLiquidity = useCallback(() => {
    console.log('Add liquidity:', addAmount);
  }, [addAmount]);

  return (
    <div className={styles.root}>
      <Separator />
      <Box className={styles.inputLine}>
        <Box className={styles.label}>
          <InfoBlock
            title="Amount"
            content={
              <>
                <Typography>Some text goes here for Add Amount.</Typography>
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
          value={addAmount}
          onChange={handleInputCapture}
        />
      </Box>
      <Separator />
      <Box className={styles.infoBlock}>
        <Box className={styles.row}>
          <Typography variant="body2">You receive:</Typography>
          <Typography variant="body2">{formatToCurrency(1222333, selectedLiquidityPool?.poolSymbol)}</Typography>
        </Box>
      </Box>
      <Button variant="primary" disabled={!addAmount} onClick={handleAddLiquidity} className={styles.actionButton}>
        Add
      </Button>
    </div>
  );
});
