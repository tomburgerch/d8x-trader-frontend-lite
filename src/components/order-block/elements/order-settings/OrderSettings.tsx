import { useAtom } from 'jotai';
import { memo, useCallback, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Slider,
  Typography,
} from '@mui/material';

import { ReactComponent as SettingsIcon } from 'assets/icons/settingsIcon.svg';
import { Dialog } from 'components/dialog/Dialog';
import { orderTypeAtom, toleranceSliderAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom } from 'store/pools.store';
import { OrderTypeE, ToleranceE } from 'types/enums';
import { MarkI } from 'types/types';

import styles from './OrderSettings.module.scss';

const marks: MarkI[] = [
  { value: 1, label: '0.1%' },
  { value: 2, label: '0.5%' },
  { value: 3, label: '1%' },
  { value: 4, label: '1.5%' },
  { value: 5, label: '2%' },
  { value: 6, label: '3%' },
  { value: 7, label: '4%' },
  { value: 8, label: '5%' },
];

const sliderToToleranceMap: Record<number, ToleranceE> = {
  1: ToleranceE['0.1%'],
  2: ToleranceE['0.5%'],
  3: ToleranceE['1%'],
  4: ToleranceE['1.5%'],
  5: ToleranceE['2%'],
  6: ToleranceE['3%'],
  7: ToleranceE['4%'],
  8: ToleranceE['5%'],
};

function valueLabelFormat(value: number) {
  return `${sliderToToleranceMap[value]}%`;
}

export const OrderSettings = memo(() => {
  const [orderType] = useAtom(orderTypeAtom);
  const [tolerance, setTolerance] = useAtom(toleranceSliderAtom);
  const [perpetualStatistics] = useAtom(perpetualStatisticsAtom);

  const [updatedTolerance, setUpdatedTolerance] = useState(2);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const openSettingsModal = useCallback(() => setShowSettingsModal(true), []);

  const closeSettingsModal = useCallback(() => {
    setUpdatedTolerance(tolerance);
    setShowSettingsModal(false);
  }, [tolerance]);

  const handleSettingsConfirm = useCallback(() => {
    setShowSettingsModal(false);
    setTolerance(updatedTolerance);
  }, [updatedTolerance, setTolerance]);

  const handleToleranceChange = useCallback((_event: Event, newValue: number | number[]) => {
    if (typeof newValue === 'number') {
      setUpdatedTolerance(newValue);
    }
  }, []);

  return (
    <>
      <Box className={styles.root}>
        <Box className={styles.keepPosLeverage}>
          <FormControlLabel value="true" control={<Checkbox />} label="Keep pos. leverage" labelPlacement="start" />
        </Box>
        <Box className={styles.settings}>
          {orderType === OrderTypeE.Market && (
            <>
              <Typography className={styles.label}>Slippage settings</Typography>
              <SettingsIcon className={styles.settingsIcon} onClick={openSettingsModal} />
            </>
          )}
          {orderType !== OrderTypeE.Market && (
            <FormControlLabel value="true" control={<Checkbox />} label="Reduce only" labelPlacement="start" />
          )}
        </Box>
      </Box>
      <Dialog open={showSettingsModal}>
        <DialogTitle>Slippage settings</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <Typography variant="body1">Slippage tolerance</Typography>
          <Slider
            aria-label="Slippage tolerance values"
            value={updatedTolerance}
            min={1}
            max={8}
            step={1}
            getAriaValueText={valueLabelFormat}
            valueLabelFormat={valueLabelFormat}
            valueLabelDisplay="auto"
            marks={marks}
            onChange={handleToleranceChange}
          />
          <Typography variant="body2" className={styles.maxEntryPrice}>
            Max entry price: 19000 {perpetualStatistics?.quoteCurrency}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSettingsModal} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSettingsConfirm} variant="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});
