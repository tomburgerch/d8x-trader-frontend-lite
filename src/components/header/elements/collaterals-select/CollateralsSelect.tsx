import { useAtom } from 'jotai';
import { memo, SyntheticEvent, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Box, Paper } from '@mui/material';
import { PaperProps } from '@mui/material/Paper/Paper';

import { ReactComponent as CollateralIcon } from 'assets/icons/collateralIcon.svg';

import { useWebSocketContext } from 'context/websocket-context/d8x/useWebSocketContext';
import { createSymbol } from 'helpers/createSymbol';
import { getTradingFee } from 'network/network';
import { clearInputsDataAtom } from 'store/order-block.store';
import { poolFeeAtom, poolsAtom, selectedPerpetualAtom, selectedPoolAtom } from 'store/pools.store';
import { PoolI } from 'types/types';

import { HeaderSelect } from '../header-select/HeaderSelect';

import styles from '../header-select/HeaderSelect.module.scss';

const CustomPaper = ({ children, ...props }: PaperProps) => {
  return (
    <Paper elevation={8} {...props}>
      <Box className={styles.optionsHeader}>
        <Box className={styles.leftLabel}>Collateral</Box>
        <Box className={styles.rightLabel}>No. of perps</Box>
      </Box>
      <Box className={styles.optionsHolder}>{children}</Box>
    </Paper>
  );
};

export const CollateralsSelect = memo(() => {
  const { address } = useAccount();
  const chainId = useChainId();

  const { isConnected, send } = useWebSocketContext();

  const [pools] = useAtom(poolsAtom);
  const [, setPoolFee] = useAtom(poolFeeAtom);
  const [selectedPool, setSelectedPool] = useAtom(selectedPoolAtom);
  const [, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [, clearInputsData] = useAtom(clearInputsDataAtom);

  useEffect(() => {
    if (selectedPool !== null && address) {
      setPoolFee(undefined);
      getTradingFee(chainId, selectedPool.poolSymbol, address).then(({ data }) => {
        setPoolFee(data);
      });
    } else if (!address) {
      setPoolFee(undefined);
    }
  }, [selectedPool, setPoolFee, chainId, address]);

  useEffect(() => {
    if (selectedPool && isConnected) {
      send(JSON.stringify({ type: 'unsubscribe' }));
      selectedPool.perpetuals.forEach(({ baseCurrency, quoteCurrency }) => {
        const symbol = createSymbol({
          baseCurrency,
          quoteCurrency,
          poolSymbol: selectedPool.poolSymbol,
        });
        send(
          JSON.stringify({
            traderAddr: address ?? '',
            symbol,
          })
        );
      });
    }
  }, [selectedPool, isConnected, send, address]);

  const handleChange = (event: SyntheticEvent, value: PoolI) => {
    setSelectedPool(value.poolSymbol);
    setSelectedPerpetual(value.perpetuals[0].id);
    clearInputsData();
  };

  return (
    <Box className={styles.holderRoot}>
      <Box className={styles.iconWrapper}>
        <CollateralIcon />
      </Box>
      <HeaderSelect<PoolI>
        id="collaterals-select"
        label="Collateral"
        items={pools}
        width="100%"
        value={selectedPool}
        onChange={handleChange}
        getOptionLabel={(option) => option.poolSymbol}
        PaperComponent={CustomPaper}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box className={styles.optionHolder}>
              <Box className={styles.label}>{option.poolSymbol}</Box>
              <Box className={styles.value}>{option.perpetuals.length}</Box>
            </Box>
          </Box>
        )}
      />
    </Box>
  );
});
