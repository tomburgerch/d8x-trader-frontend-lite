import { useAtom } from 'jotai';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';

import { Box, MenuItem } from '@mui/material';

import { ReactComponent as CollateralIcon } from 'assets/icons/collateralIcon.svg';
import { useWebSocketContext } from 'context/websocket-context/d8x/useWebSocketContext';
import { createSymbol } from 'helpers/createSymbol';
import { getOpenOrders, getPositionRisk, getTradingFee } from 'network/network';
import { clearInputsDataAtom } from 'store/order-block.store';
import {
  openOrdersAtom,
  poolFeeAtom,
  poolsAtom,
  positionsAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
  traderAPIAtom,
} from 'store/pools.store';
import { PoolI } from 'types/types';

import { HeaderSelect } from '../header-select/HeaderSelect';

import styles from '../header-select/HeaderSelect.module.scss';
import { SelectItemI } from '../header-select/types';

const OptionsHeader = () => {
  return (
    <MenuItem className={styles.optionsHeader} disabled>
      <Box className={styles.leftLabel}>Collateral</Box>
      <Box className={styles.rightLabel}>No. of perps</Box>
    </MenuItem>
  );
};

interface CollateralsSelectPropsI {
  label?: string;
}

export const CollateralsSelect = memo(({ label }: CollateralsSelectPropsI) => {
  const { address } = useAccount();
  const chainId = useChainId();

  const { isConnected, send } = useWebSocketContext();

  const [pools] = useAtom(poolsAtom);
  const [, setPoolFee] = useAtom(poolFeeAtom);
  const [, setPositions] = useAtom(positionsAtom);
  const [, setOpenOrders] = useAtom(openOrdersAtom);
  const [selectedPool, setSelectedPool] = useAtom(selectedPoolAtom);
  const [, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [, clearInputsData] = useAtom(clearInputsDataAtom);
  const [traderAPI] = useAtom(traderAPIAtom);

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

  const fetchPositions = useCallback(
    async (_chainId: number, _poolSymbol: string, _address: `0x${string}`) => {
      if (!traderAPI || traderAPI.chainId !== _chainId) {
        return;
      }
      await getPositionRisk(_chainId, traderAPI, _poolSymbol, _address)
        .then(({ data }) => {
          if (data && data.length > 0) {
            data.map((p) => setPositions(p));
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [traderAPI, setPositions]
  );

  const fetchOpenOrders = useCallback(
    async (_chainId: number, _poolSymbol: string, _address: `0x${string}`) => {
      if (!traderAPI) {
        return;
      }
      await getOpenOrders(_chainId, traderAPI, _poolSymbol, _address)
        .then(({ data }) => {
          if (data && data.length > 0) {
            data.map((orders) => setOpenOrders(orders));
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    [traderAPI, setOpenOrders]
  );

  useEffect(() => {
    if (selectedPool !== null && address) {
      fetchPositions(chainId, selectedPool.poolSymbol, address).then(() => {
        fetchOpenOrders(chainId, selectedPool.poolSymbol, address).then();
      });
    }
  }, [selectedPool, chainId, address, fetchOpenOrders, fetchPositions]);

  const handleChange = (newItem: PoolI) => {
    setSelectedPool(newItem.poolSymbol);
    setSelectedPerpetual(newItem.perpetuals[0].id);
    clearInputsData();
  };

  const selectItems: SelectItemI<PoolI>[] = useMemo(() => {
    return pools.map((pool) => ({ value: pool.poolSymbol, item: pool }));
  }, [pools]);

  return (
    <Box className={styles.holderRoot}>
      <Box className={styles.iconWrapper}>
        <CollateralIcon />
      </Box>
      <HeaderSelect<PoolI>
        id="collaterals-select"
        label={label ? label : 'Collateral'}
        items={selectItems}
        width="100%"
        value={selectedPool?.poolSymbol}
        handleChange={handleChange}
        OptionsHeader={OptionsHeader}
        renderLabel={(value) => value.poolSymbol}
        renderOption={(option) => (
          <MenuItem key={option.value} value={option.value} selected={option.value === selectedPool?.poolSymbol}>
            <Box className={styles.optionHolder}>
              <Box className={styles.label}>{option.item.poolSymbol}</Box>
              <Box className={styles.value}>{option.item.perpetuals.length}</Box>
            </Box>
          </MenuItem>
        )}
      />
    </Box>
  );
});
