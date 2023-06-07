import { useAtom } from 'jotai';
import { memo, useCallback } from 'react';

import { Box, Button, Typography } from '@mui/material';

import { Separator } from 'components/separator/Separator';
import { InfoBlock } from 'components/info-block/InfoBlock';
import { selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from './WithdrawAction.module.scss';

export const WithdrawAction = memo(() => {
  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);

  const handleWithdrawLiquidity = useCallback(() => {
    console.log('Withdraw liquidity');
  }, []);

  return (
    <div className={styles.root}>
      <Separator />
      <Box className={styles.inputLine}>
        <Box className={styles.label}>
          <InfoBlock
            title="Withdrawable amount"
            content={
              <>
                <Typography>Some text goes here for Withdrawable Amount.</Typography>
                <Typography>More text goes here...</Typography>
              </>
            }
          />
        </Box>
        <Typography variant="body1" className={styles.value}>
          {formatToCurrency(3455, selectedLiquidityPool?.poolSymbol)}
        </Typography>
      </Box>
      <Box className={styles.inputLine}>
        <Box className={styles.label}>
          <InfoBlock
            title="dMATIC price"
            content={
              <>
                <Typography>Some text goes here for dMATIC price.</Typography>
                <Typography>More text goes here...</Typography>
              </>
            }
          />
        </Box>
        <Typography variant="body1" className={styles.value}>
          {formatToCurrency(10, selectedLiquidityPool?.poolSymbol)}
        </Typography>
      </Box>
      <Separator />
      <Box className={styles.infoBlock}>
        <Box className={styles.row}>
          <Typography variant="body2">You receive:</Typography>
          <Typography variant="body2">{formatToCurrency(1222333, selectedLiquidityPool?.poolSymbol)}</Typography>
        </Box>
      </Box>
      <Button variant="primary" onClick={handleWithdrawLiquidity} className={styles.actionButton}>
        Withdraw
      </Button>
    </div>
  );
});
