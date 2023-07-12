import { useAtom } from 'jotai/index';
import { memo, useEffect, useMemo, useRef } from 'react';
import { useChainId, useNetwork } from 'wagmi';

import { Box, MenuItem } from '@mui/material';

import { ReactComponent as PerpetualIcon } from 'assets/icons/perpetualIcon.svg';
import { useCandlesWebSocketContext } from 'context/websocket-context/candles/useCandlesWebSocketContext';
import { createSymbol } from 'helpers/createSymbol';
import { getPerpetualStaticInfo } from 'network/network';
import { clearInputsDataAtom } from 'store/order-block.store';
import {
  perpetualStaticInfoAtom,
  perpetualStatisticsAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
  traderAPIAtom,
} from 'store/pools.store';
import { candlesAtom, candlesDataReadyAtom, newCandlesAtom, selectedPeriodAtom } from 'store/tv-chart.store';
import { PerpetualI } from 'types/types';

import { HeaderSelect } from '../header-select/HeaderSelect';
import { SelectItemI } from '../header-select/types';

import styles from '../header-select/HeaderSelect.module.scss';

const OptionsHeader = () => {
  return (
    <MenuItem className={styles.optionsHeader} disabled>
      <Box className={styles.leftLabel}>Pair</Box>
      <Box className={styles.rightLabel}>Status</Box>
    </MenuItem>
  );
};

export const PerpetualsSelect = memo(() => {
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [selectedPerpetual, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [selectedPeriod] = useAtom(selectedPeriodAtom);
  const [, setPerpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [, setPerpetualStaticInfo] = useAtom(perpetualStaticInfoAtom);
  const [, setCandles] = useAtom(candlesAtom);
  const [, setNewCandles] = useAtom(newCandlesAtom);
  const [, setCandlesDataReady] = useAtom(candlesDataReadyAtom);
  const [traderAPI] = useAtom(traderAPIAtom);
  const [, clearInputsData] = useAtom(clearInputsDataAtom);

  const { chain } = useNetwork();
  const chainId = useChainId();

  const traderAPIRef = useRef(traderAPI);

  // const chainId = useChainId();

  const { isConnected, send } = useCandlesWebSocketContext();

  const symbol = useMemo(() => {
    if (selectedPool && selectedPerpetual) {
      return createSymbol({
        baseCurrency: selectedPerpetual.baseCurrency,
        quoteCurrency: selectedPerpetual.quoteCurrency,
        poolSymbol: selectedPool.poolSymbol,
      });
    }
    return '';
  }, [selectedPool, selectedPerpetual]);

  useEffect(() => {
    if (selectedPool && selectedPerpetual) {
      setPerpetualStatistics({
        id: selectedPerpetual.id,
        baseCurrency: selectedPerpetual.baseCurrency,
        quoteCurrency: selectedPerpetual.quoteCurrency,
        poolName: selectedPool.poolSymbol,
        midPrice: selectedPerpetual.midPrice,
        markPrice: selectedPerpetual.markPrice,
        indexPrice: selectedPerpetual.indexPrice,
        currentFundingRateBps: selectedPerpetual.currentFundingRateBps,
        openInterestBC: selectedPerpetual.openInterestBC,
      });
    }
  }, [selectedPool, selectedPerpetual, setPerpetualStatistics]);

  useEffect(() => {
    if (selectedPerpetual && isConnected) {
      send(JSON.stringify({ type: 'unsubscribe' }));
      send(
        JSON.stringify({
          type: 'subscribe',
          symbol: `${selectedPerpetual.baseCurrency}-${selectedPerpetual.quoteCurrency}`,
          period: selectedPeriod,
        })
      );
      setNewCandles([]);
      setCandlesDataReady(false);
    }
  }, [selectedPerpetual, selectedPeriod, setCandles, setNewCandles, setCandlesDataReady, isConnected, send]);

  useEffect(() => {
    if (symbol && chainId && chainId === chain?.id) {
      getPerpetualStaticInfo(chainId, traderAPIRef.current, symbol).then(({ data }) => {
        setPerpetualStaticInfo(data);
      });
    }
  }, [chain, chainId, symbol, setPerpetualStaticInfo]);

  const handleChange = (newItem: PerpetualI) => {
    setSelectedPerpetual(newItem.id);
    clearInputsData();
  };

  const selectItems: SelectItemI<PerpetualI>[] = useMemo(() => {
    return (selectedPool?.perpetuals ?? []).map((perpetual) => ({ value: `${perpetual.id}`, item: perpetual }));
  }, [selectedPool]);

  return (
    <Box className={styles.holderRoot}>
      <Box className={styles.iconWrapper}>
        <PerpetualIcon />
      </Box>
      <HeaderSelect<PerpetualI>
        id="perpetuals-select"
        label="Perpetual"
        items={selectItems}
        width="100%"
        value={`${selectedPerpetual?.id}`}
        handleChange={handleChange}
        OptionsHeader={OptionsHeader}
        renderLabel={(value) => `${value.baseCurrency}/${value.quoteCurrency}`}
        renderOption={(option) => (
          <MenuItem key={option.value} value={option.value} selected={option.value === `${selectedPerpetual?.id}`}>
            <Box className={styles.optionHolder}>
              <Box className={styles.label}>
                {option.item.baseCurrency}/{option.item.quoteCurrency}
              </Box>
              <Box className={styles.value}>{option.item.isMarketClosed ? 'CLOSED' : 'OPEN'}</Box>
            </Box>
          </MenuItem>
        )}
      />
    </Box>
  );
});
