import { useAtom } from 'jotai/index';
import type { SyntheticEvent } from 'react';
import { memo } from 'react';

import { Box, Paper } from '@mui/material';
import { PaperProps } from '@mui/material/Paper/Paper';

import { selectedPerpetualAtom, selectedPoolAtom } from 'store/pools.store';
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

export const PerpetualsSelect = memo(() => {
  const [selectedPool] = useAtom(selectedPoolAtom);
  const [selectedPerpetual, setSelectedPerpetual] = useAtom(selectedPerpetualAtom);

  const handleChange = (event: SyntheticEvent, value: PerpetualI) => {
    setSelectedPerpetual(value.id);
  };

  return (
    <HeaderSelect<PerpetualI>
      id="perpetuals-select"
      label="Perpetual"
      items={selectedPool?.perpetuals ?? []}
      width="250px"
      value={selectedPerpetual}
      onChange={handleChange}
      PaperComponent={CustomPaper}
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
