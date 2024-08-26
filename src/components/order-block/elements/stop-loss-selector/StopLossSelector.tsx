import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from '@mui/material';

import { CustomPriceModal } from 'components/custom-price-modal/CustomPriceModal';
import { CustomPriceSelector } from 'components/custom-price-selector/CustomPriceSelector';
import { InfoLabelBlock } from 'components/info-label-block/InfoLabelBlock';
import { calculateProbability } from 'helpers/calculateProbability';
import { calculateStepSize } from 'helpers/calculateStepSize';
import { stopLossModalOpenAtom } from 'store/global-modals.store';
import { orderInfoAtom, stopLossAtom, stopLossInputPriceAtom, stopLossPriceAtom } from 'store/order-block.store';
import { selectedPerpetualAtom, traderAPIAtom } from 'store/pools.store';
import { OrderBlockE, OrderTypeE, StopLossE } from 'types/enums';
import { valueToFractionDigits } from 'utils/formatToCurrency';

import styles from './StopLossSelector.module.scss';

export const StopLossSelector = memo(() => {
  const { t } = useTranslation();

  const traderAPI = useAtomValue(traderAPIAtom);
  const orderInfo = useAtomValue(orderInfoAtom);
  const selectedPerpetual = useAtomValue(selectedPerpetualAtom);
  const setStopLossPrice = useSetAtom(stopLossPriceAtom);
  const setStopLossModalOpen = useSetAtom(stopLossModalOpenAtom);
  const [stopLoss, setStopLoss] = useAtom(stopLossAtom);
  const [stopLossInputPrice, setStopLossInputPrice] = useAtom(stopLossInputPriceAtom);

  const [isDisabled, setDisabled] = useState(false);

  const currentOrderBlockRef = useRef(orderInfo?.orderBlock);
  const currentLeverageRef = useRef(orderInfo?.leverage);

  const handleStopLossPriceChange = (stopLossPriceValue: string) => {
    if (stopLossPriceValue !== '') {
      setStopLossInputPrice(+stopLossPriceValue);
      setStopLoss(null);
    } else {
      setStopLossInputPrice(null);
    }
  };

  const handleStopLossChange = (stopLossValue: StopLossE) => {
    setStopLossPrice(null);
    setStopLossInputPrice(null);
    setStopLoss(stopLossValue);
  };

  const [midPrice, isPredictionMarket] = useMemo(() => {
    if (!!traderAPI && !!orderInfo) {
      try {
        const predMarket = traderAPI?.isPredictionMarket(orderInfo.symbol);
        return [
          predMarket
            ? calculateProbability(orderInfo.midPrice, orderInfo.orderBlock === OrderBlockE.Short)
            : orderInfo.midPrice,
          predMarket,
        ];
      } catch (error) {
        // skip
      }
    }
    return [orderInfo?.midPrice, false];
  }, [orderInfo, traderAPI]);

  const minStopLossPrice = useMemo(() => {
    if (midPrice === undefined) {
      return 0.000000001;
    }
    if (orderInfo?.orderBlock === OrderBlockE.Short) {
      return isPredictionMarket ? midPrice - midPrice / orderInfo.leverage : midPrice;
    } else if (orderInfo?.leverage) {
      return Math.max(0.000000001, midPrice - midPrice / orderInfo.leverage);
    }
    return 0.000000001;
  }, [orderInfo?.orderBlock, orderInfo?.leverage, midPrice, isPredictionMarket]);

  const maxStopLossPrice = useMemo(() => {
    if (typeof midPrice === 'number' && orderInfo?.orderBlock === OrderBlockE.Long) {
      return midPrice;
    } else if (typeof midPrice === 'number' && orderInfo?.leverage) {
      return isPredictionMarket ? midPrice : midPrice + midPrice / orderInfo.leverage;
    }
  }, [orderInfo?.orderBlock, orderInfo?.leverage, midPrice, isPredictionMarket]);

  const stepSize = useMemo(() => calculateStepSize(selectedPerpetual?.indexPrice), [selectedPerpetual?.indexPrice]);

  const validateStopLossPrice = useCallback(() => {
    if (stopLossInputPrice === null) {
      setStopLossPrice(null);
      setStopLoss(StopLossE.None);
      return;
    }

    if (maxStopLossPrice && stopLossInputPrice > maxStopLossPrice) {
      const maxStopLossPriceRounded = +maxStopLossPrice;
      setStopLossPrice(maxStopLossPriceRounded);
      setStopLossInputPrice(maxStopLossPriceRounded);
      return;
    }
    if (stopLossInputPrice < minStopLossPrice) {
      const minStopLossPriceRounded = +minStopLossPrice;
      setStopLossPrice(minStopLossPriceRounded);
      setStopLossInputPrice(minStopLossPriceRounded);
      return;
    }

    setStopLossPrice(stopLossInputPrice);
  }, [minStopLossPrice, maxStopLossPrice, stopLossInputPrice, setStopLoss, setStopLossPrice, setStopLossInputPrice]);

  useEffect(() => {
    if (currentOrderBlockRef.current !== orderInfo?.orderBlock) {
      currentOrderBlockRef.current = orderInfo?.orderBlock;

      setStopLossPrice(null);
      setStopLossInputPrice(null);

      if (orderInfo?.stopLoss === null) {
        setStopLoss(StopLossE.None);
      }
    }
  }, [orderInfo?.orderBlock, orderInfo?.stopLoss, setStopLoss, setStopLossPrice, setStopLossInputPrice]);

  useEffect(() => {
    if (currentLeverageRef.current !== orderInfo?.leverage) {
      currentLeverageRef.current = orderInfo?.leverage;

      validateStopLossPrice();
    }
  }, [orderInfo?.leverage, validateStopLossPrice]);

  useEffect(() => {
    if (stopLoss && stopLoss !== StopLossE.None && orderInfo?.stopLossPrice) {
      setStopLossInputPrice(+orderInfo.stopLossPrice.toFixed(valueToFractionDigits(+orderInfo.stopLossPrice)));
    } else if (stopLoss && stopLoss === StopLossE.None) {
      setStopLossInputPrice(null);
    }
  }, [stopLoss, orderInfo?.stopLossPrice, setStopLossInputPrice]);

  useEffect(() => {
    if (orderInfo && orderInfo.reduceOnly && orderInfo.orderType !== OrderTypeE.Market) {
      setStopLossInputPrice(null);
      setStopLossPrice(null);
      setStopLoss(StopLossE.None);
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [setStopLossInputPrice, setStopLossPrice, setStopLoss, orderInfo]);

  const handleModalOpen = useCallback(() => {
    setStopLossModalOpen(true);
  }, [setStopLossModalOpen]);

  const calculatedPercent = useMemo(() => {
    if (stopLossInputPrice === null || !midPrice) {
      return '--';
    }
    let percent = stopLossInputPrice / midPrice - 1;
    if (percent > -0.005) {
      percent = 0;
    }
    return `${Math.round(100 * percent)}%`;
  }, [midPrice, stopLossInputPrice]);

  const translationMap: Record<StopLossE, string> = {
    [StopLossE.None]: t('pages.trade.order-block.stop-loss.none'),
    [StopLossE['5%']]: '5%',
    [StopLossE['25%']]: '25%',
    [StopLossE['50%']]: '50%',
    [StopLossE['75%']]: '75%',
  };

  return (
    <>
      <CustomPriceSelector<StopLossE>
        id="custom-stop-loss-price"
        label={
          <InfoLabelBlock
            title={t('pages.trade.order-block.stop-loss.title')}
            content={
              <>
                <Typography>{t('pages.trade.order-block.stop-loss.body1')}</Typography>
                <Typography>{t('pages.trade.order-block.stop-loss.body2')}</Typography>
                <Typography>{t('pages.trade.order-block.stop-loss.body3')}</Typography>
              </>
            }
          />
        }
        options={Object.values(StopLossE)}
        translationMap={translationMap}
        handlePriceChange={handleStopLossChange}
        handleInputPriceChange={handleStopLossPriceChange}
        validateInputPrice={validateStopLossPrice}
        selectedInputPrice={stopLossInputPrice}
        selectedPrice={stopLoss}
        stepSize={stepSize}
        disabled={isDisabled}
        percentComponent={
          <div onClick={handleModalOpen} className={styles.percent}>
            {calculatedPercent}
          </div>
        }
      />

      <CustomPriceModal />
    </>
  );
});
