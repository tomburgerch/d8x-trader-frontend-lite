import { useAtom } from 'jotai';
import type { ChangeEvent } from 'react';
import { memo, useCallback, useMemo } from 'react';

import { Box, InputAdornment, OutlinedInput, Slider } from '@mui/material';

import { leverageAtom } from 'store/order-block.store';
import { perpetualStaticInfoAtom } from 'store/pools.store';
import { MarkI } from 'types/types';

import styles from './LeverageSelector.module.scss';

const multipliers = [0.25, 0.5, 0.75, 1];

function valueLabelFormat(value: number) {
  return `${value}x`;
}

export const LeverageSelector = memo(() => {
  const [leverage, setLeverage] = useAtom(leverageAtom);
  const [perpetualStaticInfo] = useAtom(perpetualStaticInfoAtom);

  const maxLeverage = useMemo(() => {
    if (perpetualStaticInfo) {
      const newLeverage = Math.round(1 / perpetualStaticInfo.initialMarginRate);
      if (newLeverage < leverage) {
        setLeverage(newLeverage);
      }
      return newLeverage;
    }
    return 10;
  }, [perpetualStaticInfo, leverage, setLeverage]);

  const marks = useMemo(() => {
    const newMarks: MarkI[] = [{ value: 1, label: '1x' }];
    multipliers.forEach((multiplier) =>
      newMarks.push({ value: multiplier * maxLeverage, label: `${multiplier * maxLeverage}x` })
    );
    return newMarks;
  }, [maxLeverage]);

  const handleLeverageChange = useCallback(
    (event: Event, newValue: number | number[]) => {
      if (typeof newValue === 'number') {
        setLeverage(newValue);
      }
    },
    [setLeverage]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setLeverage(+event.target.value);
    },
    [setLeverage]
  );

  return (
    <Box className={styles.root}>
      <Box>Leverage</Box>
      <Box className={styles.sliderHolder}>
        <Slider
          aria-label="Leverage values"
          value={leverage}
          min={1}
          max={maxLeverage}
          step={(maxLeverage / 2) % 10 ? 0.5 : 1}
          getAriaValueText={valueLabelFormat}
          valueLabelFormat={valueLabelFormat}
          valueLabelDisplay="auto"
          marks={marks}
          onChange={handleLeverageChange}
        />
      </Box>
      <Box className={styles.inputHolder}>
        <OutlinedInput
          id="leverage"
          type="number"
          inputProps={{ min: 1, max: maxLeverage }}
          endAdornment={<InputAdornment position="end">x</InputAdornment>}
          onChange={handleInputChange}
          value={leverage}
        />
      </Box>
    </Box>
  );
});
