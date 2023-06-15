import { useAtom } from 'jotai';
import { memo } from 'react';

import { Box, Typography } from '@mui/material';

import { liquidityTypeAtom } from 'store/liquidity-pools.store';
import { LiquidityTypeE } from 'types/enums';

import { AddAction } from './elements/add-action/AddAction';
import { InitiateAction } from './elements/initiate-action/InitiateAction';
import { LiquidityTypeSelector } from './elements/liquidity-type-selector/LiquidityTypeSelector';
import { WithdrawAction } from './elements/withdraw-action/WithdrawAction';

import styles from './LiquidityBlock.module.scss';

export const LiquidityBlock = memo(() => {
  const [liquidityType] = useAtom(liquidityTypeAtom);

  return (
    <Box className={styles.root}>
      <Box className={styles.infoBlock}>
        <Typography variant="h4">{liquidityType} Liquidity</Typography>
        <Typography variant="body1" className={styles.text}>
          Provide liquidity, earn money, go chill at the beach
        </Typography>
        <Typography variant="body1" className={styles.text}>
          This is the way
        </Typography>
        <Typography variant="body1" className={styles.text}>
          This is the way
        </Typography>
        <Typography variant="body1" className={styles.text}>
          Disclaimer: maybe this is not the way
        </Typography>
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
