import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Typography } from '@mui/material';

import { liquidityTypeAtom, selectedLiquidityPoolAtom } from 'store/liquidity-pools.store';
import { LiquidityTypeE } from 'types/enums';

import { AddAction } from './elements/add-action/AddAction';
import { InitiateAction } from './elements/initiate-action/InitiateAction';
import { LiquidityTypeSelector } from './elements/liquidity-type-selector/LiquidityTypeSelector';
import { WithdrawAction } from './elements/withdraw-action/WithdrawAction';

import styles from './LiquidityBlock.module.scss';

export const LiquidityBlock = memo(() => {
  const [liquidityType] = useAtom(liquidityTypeAtom);
  const [selectedLiquidityPool] = useAtom(selectedLiquidityPoolAtom);

  return (
    <Box className={styles.root}>
      <Box className={styles.infoBlock}>
        <Typography variant="h4">{liquidityType} Liquidity</Typography>
        {liquidityType === LiquidityTypeE.Add && (
          <>
            <Typography variant="body1" className={styles.text}>
              Add liquidity in {selectedLiquidityPool?.poolSymbol} and receive d{selectedLiquidityPool?.poolSymbol}, an
              ERC-20 token representing your ownership in the liquidity pool.
            </Typography>
            <Typography variant="body1" className={styles.text}>
              LPs earn trading fees, funding rate payments and PnL, on all trades collateralized in{' '}
              {selectedLiquidityPool?.poolSymbol}, d{selectedLiquidityPool?.poolSymbol} accumulates these fees in
              real-time.
            </Typography>
            <Typography variant="body1" className={styles.text}>
              LPs serve as the counterparty to all trades in the pool.
            </Typography>
          </>
        )}
        {liquidityType === LiquidityTypeE.Initiate && (
          <>
            <Typography variant="body1" className={styles.text}>
              Initiate withdrawal of your {selectedLiquidityPool?.poolSymbol} in the liquidity pool. You will be able to
              withdraw your funds 48 hours after you initiated the withdrawal.
            </Typography>
            <Typography variant="body1" className={styles.text}>
              Please note that you can only initiate one withdrawal request at a time.
            </Typography>
          </>
        )}
        {liquidityType === LiquidityTypeE.Withdraw && (
          <>
            <Typography variant="body1" className={styles.text}>
              Withdraw your {selectedLiquidityPool?.poolSymbol} in exchange for your d
              {selectedLiquidityPool?.poolSymbol}.
            </Typography>
            <Typography variant="body1" className={styles.text}>
              Please note that you first need to initiate a withdrawal before being able to withdraw.
            </Typography>
          </>
        )}
      </Box>
      <Box className={styles.actionBlock}>
        <LiquidityTypeSelector />
        {liquidityType === LiquidityTypeE.Add && <AddAction />}
        {liquidityType === LiquidityTypeE.Initiate && <InitiateAction />}
        {liquidityType === LiquidityTypeE.Withdraw && <WithdrawAction />}
      </Box>
    </Box>
  );
});
