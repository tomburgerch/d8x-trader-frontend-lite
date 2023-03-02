import { useAtom } from 'jotai';
import type { SyntheticEvent } from 'react';
import { memo, useEffect } from 'react';
import { useAccount } from 'wagmi';

import { Box, Paper } from '@mui/material';
import { PaperProps } from '@mui/material/Paper/Paper';

import { createSymbol } from 'helpers/createSymbol';
import { getOpenOrders, getPoolFee, getPositionRisk } from 'network/network';
import {
  openOrdersAtom,
  poolFeeAtom,
  poolsAtom,
  positionsAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
} from 'store/pools.store';
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
  const { address } = useAccount();

  const [pools] = useAtom(poolsAtom);
  const [, setPoolFee] = useAtom(poolFeeAtom);
  const [, setPositions] = useAtom(positionsAtom);
  const [, setOpenOrders] = useAtom(openOrdersAtom);
  const [selectedPool, setSelectedPool] = useAtom(selectedPoolAtom);
  const [, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);

  useEffect(() => {
    if (selectedPool !== null) {
      setPoolFee(0);
      getPoolFee(selectedPool.poolSymbol, address).then(({ data }) => {
        setPoolFee(data);
      });
    }
  }, [selectedPool, setPoolFee, address]);

  useEffect(() => {
    if (selectedPool !== null && address) {
      selectedPool.perpetuals.forEach(({ baseCurrency, quoteCurrency }) => {
        const symbol = createSymbol({
          baseCurrency,
          quoteCurrency,
          poolSymbol: selectedPool.poolSymbol,
        });
        getOpenOrders(symbol, address).then(({ data }) => {
          setOpenOrders(data);
        });
        getPositionRisk(symbol, address).then(({ data }) => {
          setPositions(data);
        });
      });
    }
  }, [selectedPool, address, setOpenOrders, setPositions]);

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
