import { useAtom } from 'jotai/index';
import type { SyntheticEvent } from 'react';
import { memo, useEffect, useMemo } from 'react';

import { Box, Paper, Popper, PopperProps } from '@mui/material';
import { PaperProps } from '@mui/material/Paper/Paper';

import { createSymbol } from 'helpers/createSymbol';
import { getPerpetualStaticInfo } from 'network/network';
import {
  perpetualStaticInfoAtom,
  perpetualStatisticsAtom,
  selectedPerpetualAtom,
  selectedPoolAtom,
} from 'store/pools.store';
import { PerpetualI } from 'types/types';

import { HeaderSelect } from '../header-select/HeaderSelect';

import styles from './PerpetualsSelect.module.scss';

const CustomPaper = ({ children, ...props }: PaperProps) => {
  return (
    <Paper elevation={8} {...props}>
      <Box className={styles.optionsHeader}>
        <Box className={styles.pair}>Pair</Box>
        <Box className={styles.status}>Status</Box>
      </Box>
      <Box className={styles.optionsHolder}>{children}</Box>
    </Paper>
  );
};

const CustomPopper = (props: PopperProps) => {
  return <Popper {...props} placement="auto" />;
};

export const PerpetualsSelect = memo(() => {
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [selectedPerpetual, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);
  const [, setPerpetualStatistics] = useAtom(perpetualStatisticsAtom);
  const [, setPerpetualStaticInfo] = useAtom(perpetualStaticInfoAtom);

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
    if (symbol) {
      getPerpetualStaticInfo(symbol).then(({ data }) => {
        setPerpetualStaticInfo(data);
      });
    }
  }, [symbol, setPerpetualStaticInfo]);

  const handleChange = (event: SyntheticEvent, value: PerpetualI) => {
    setSelectedPerpetual(value.id);
  };

  return (
    <HeaderSelect<PerpetualI>
      id="perpetuals-select"
      label="Perpetual"
      items={selectedPool?.perpetuals ?? []}
      width="100%"
      value={selectedPerpetual}
      onChange={handleChange}
      PaperComponent={CustomPaper}
      PopperComponent={CustomPopper}
      getOptionLabel={(option) => `${option.baseCurrency}/${option.quoteCurrency}`}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box className={styles.optionHolder}>
            <Box className={styles.pair}>
              {option.baseCurrency}/{option.quoteCurrency}
            </Box>
            <Box className={styles.status}>{option.state}</Box>
          </Box>
        </Box>
      )}
    />
  );
});
