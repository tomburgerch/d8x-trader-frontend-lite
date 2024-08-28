import { useAtom, useAtomValue } from 'jotai';
import { memo, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox, FormControlLabel, Typography } from '@mui/material';

import { InfoLabelBlock } from 'components/info-label-block/InfoLabelBlock';
import { ExpirySelector } from 'components/order-block/elements/expiry-selector/ExpirySelector';
import { SlippageSelector } from 'components/order-block/elements/slippage-selector/SlippageSelector';
import { createSymbol } from 'helpers/createSymbol';
import { orderInfoAtom, orderTypeAtom, reduceOnlyAtom } from 'store/order-block.store';
import { perpetualStatisticsAtom, positionsAtom } from 'store/pools.store';
import { OrderBlockE, OrderSideE, OrderTypeE } from 'types/enums';

import styles from './OrderSettings.module.scss';

export const OrderSettings = memo(() => {
  const { t } = useTranslation();

  const positions = useAtomValue(positionsAtom);
  const orderType = useAtomValue(orderTypeAtom);
  const perpetualStatistics = useAtomValue(perpetualStatisticsAtom);
  // const [keepPositionLeverage, setKeepPositionLeverage] = useAtom(keepPositionLeverageAtom);
  const [reduceOnly, setReduceOnly] = useAtom(reduceOnlyAtom);
  const orderInfo = useAtomValue(orderInfoAtom);

  const isReduceOnlyEnabled = useMemo(() => {
    if (perpetualStatistics && orderInfo) {
      const symbol = createSymbol({
        baseCurrency: perpetualStatistics.baseCurrency,
        quoteCurrency: perpetualStatistics.quoteCurrency,
        poolSymbol: perpetualStatistics.poolName,
      });

      const side = orderInfo.orderBlock === OrderBlockE.Long ? OrderSideE.Buy : OrderSideE.Sell;

      return !!positions.find((position) => position.symbol === symbol && position.side != side);
    }
    return true;
    // return false;
  }, [perpetualStatistics, positions, orderInfo]);

  useEffect(() => {
    if (!isReduceOnlyEnabled) {
      setReduceOnly(false);
    }
  }, [isReduceOnlyEnabled, setReduceOnly]);

  // const isKeepPosLeverageDisabled = useMemo(() => {
  //   if (perpetualStatistics) {
  //     const symbol = createSymbol({
  //       baseCurrency: perpetualStatistics.baseCurrency,
  //       quoteCurrency: perpetualStatistics.quoteCurrency,
  //       poolSymbol: perpetualStatistics.poolName,
  //     });
  //
  //     return !positions.find((position) => position.symbol === symbol);
  //   }
  //   return true;
  // }, [perpetualStatistics, positions]);

  return (
    <div className={styles.root}>
      {/*
        <div className={styles.keepPosLeverage}>
          <FormControlLabel
            id="keep-position-leverage"
            value="true"
            defaultChecked={keepPositionLeverage}
            disabled={isKeepPosLeverageDisabled}
            onChange={(_event, checked) => setKeepPositionLeverage(checked)}
            control={keepPositionLeverage ? <Checkbox checked={true} /> : <Checkbox checked={false} />}
            label="Keep pos. leverage"
            labelPlacement="end"
          />
        </div>
        */}

      {orderType === OrderTypeE.Market && (
        <div className={styles.settings}>
          <div className={styles.label}>
            <InfoLabelBlock
              title={t('pages.trade.order-block.slippage.title')}
              content={<Typography>{t('pages.trade.order-block.slippage.body')}</Typography>}
            />
          </div>
          <div className={styles.options}>
            <SlippageSelector />
          </div>
        </div>
      )}
      {orderType !== OrderTypeE.Market && (
        <>
          {isReduceOnlyEnabled && (
            <div className={styles.settings}>
              <FormControlLabel
                id="reduce-only"
                value="true"
                defaultChecked={reduceOnly}
                onChange={(_event, checked) => setReduceOnly(checked)}
                control={<Checkbox checked={reduceOnly} />}
                label={<Typography variant="bodyTiny">{t('pages.trade.order-block.reduce-only')}</Typography>}
                labelPlacement="end"
              />
            </div>
          )}
          <div className={styles.settings}>
            <div className={styles.label}>
              <InfoLabelBlock
                title={t('pages.trade.order-block.expiry.title')}
                content={<Typography>{t('pages.trade.order-block.expiry.body')}</Typography>}
              />
            </div>
            <div className={styles.options}>
              <ExpirySelector />
            </div>
          </div>
        </>
      )}
    </div>
  );
});
