import classnames from 'classnames';
import { useAtomValue, useSetAtom } from 'jotai';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Typography } from '@mui/material';

import { InfoLabelBlock } from 'components/info-label-block/InfoLabelBlock';
import { ResponsiveInput } from 'components/responsive-input/ResponsiveInput';
import { perpetualStaticInfoAtom } from 'store/pools.store';
import type { MarkI } from 'types/types';

import { inputValueAtom, leverageAtom, setLeverageAtom } from './store';

import styles from './LeverageSelector.module.scss';

const multipliers = [0.2, 0.4, 0.6, 0.8, 1];

export const LeverageSelector = memo(() => {
  const { t } = useTranslation();

  const leverage = useAtomValue(leverageAtom);
  const perpetualStaticInfo = useAtomValue(perpetualStaticInfoAtom);
  const inputValue = useAtomValue(inputValueAtom);
  const setLeverage = useSetAtom(setLeverageAtom);

  const maxLeverage = useMemo(() => {
    if (perpetualStaticInfo?.initialMarginRate) {
      return Math.round(1 / perpetualStaticInfo.initialMarginRate);
    }
    return 10;
  }, [perpetualStaticInfo?.initialMarginRate]);

  const marks = useMemo(() => {
    const newMarks: MarkI[] = [];
    multipliers.forEach((multiplier) =>
      newMarks.push({
        value: multiplier * maxLeverage,
        // label: `${multiplier * maxLeverage}x`
      })
    );
    return newMarks;
  }, [maxLeverage]);

  const handleLeverageInputChange = useCallback(
    (value: string) => {
      setLeverage(Number(value));
    },
    [setLeverage]
  );

  const handleInputBlur = useCallback(() => {
    setLeverage(leverage);
  }, [setLeverage, leverage]);

  const leverageStep = (maxLeverage / 2) % 10 ? 0.5 : 1;

  return (
    <div className={styles.root}>
      <div className={styles.rowOne}>
        <InfoLabelBlock
          title={t('pages.trade.order-block.leverage.title')}
          content={
            <>
              <Typography>{t('pages.trade.order-block.leverage.body1')}</Typography>
              <Typography>{t('pages.trade.order-block.leverage.body2')}</Typography>
            </>
          }
        />
      </div>
      <div className={styles.rowTwo}>
        <div className={styles.buttonsHolder}>
          {marks.map((mark) => (
            <Button
              key={mark.value}
              className={classnames(styles.markButton, { [styles.selected]: mark.value === leverage })}
              variant={mark.value === leverage ? 'primary' : 'outlined'}
              size="small"
              onClick={() => setLeverage(mark.value)}
            >
              {mark.value}x
            </Button>
          ))}
        </div>
        <ResponsiveInput
          id="leverage"
          className={styles.inputHolder}
          inputValue={inputValue}
          setInputValue={handleLeverageInputChange}
          handleInputBlur={handleInputBlur}
          currency="X"
          step={`${leverageStep}`}
          min={0}
          max={maxLeverage}
        />
      </div>
    </div>
  );
});
