import { useAtom } from 'jotai';
import type { SyntheticEvent } from 'react';
import { memo } from 'react';

import { Box, Paper } from '@mui/material';
import { PaperProps } from '@mui/material/Paper/Paper';

import { poolsAtom, selectedPerpetualAtom, selectedPoolAtom } from 'store/pools.store';
import { PoolI } from 'types/types';

import { HeaderSelect } from '../header-select/HeaderSelect';

import styles from './CollateralsSelect.module.scss';

const CustomPaper = ({ children, ...props }: PaperProps) => {
  return (
    <Paper elevation={8} {...props}>
      <Box className={styles.optionsHeader}>
        <Box className={styles.symbol}>Collateral</Box>
        <Box className={styles.count}>No. of perps</Box>
      </Box>
      <Box className={styles.optionsHolder}>{children}</Box>
    </Paper>
  );
};

export const CollateralsSelect = memo(() => {
  const [pools] = useAtom(poolsAtom);
  const [selectedPool, setSelectedPool] = useAtom(selectedPoolAtom);
  const [, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);

  const handleChange = (event: SyntheticEvent, value: PoolI) => {
    setSelectedPool(value.poolSymbol);
    setSelectedPerpetual(value.perpetuals[0].id);
  };

  return (
    <HeaderSelect<PoolI>
      id="collaterals-select"
      label="Collateral"
      items={pools}
      width="210px"
      value={selectedPool}
      onChange={handleChange}
      getOptionLabel={(option) => option.poolSymbol}
      PaperComponent={CustomPaper}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box className={styles.optionHolder}>
            <Box className={styles.symbol}>{option.poolSymbol}</Box>
            <Box className={styles.count}>{option.perpetuals.length}</Box>
          </Box>
        </Box>
      )}
    />
  );
});