import classnames from 'classnames';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { TradingViewChart } from 'components/trading-view-chart/TradingViewChart';
import { stopLossModalOpenAtom, takeProfitModalOpenAtom } from 'store/global-modals.store';
import {
  stopLossAtom,
  stopLossInputPriceAtom,
  stopLossPriceAtom,
  takeProfitAtom,
  takeProfitInputPriceAtom,
  takeProfitPriceAtom,
} from 'store/order-block.store';
import { selectedPerpetualAtom } from 'store/pools.store';
import { StopLossE, TakeProfitE } from 'types/enums';
import type { TemporaryAnyT } from 'types/types';
import { getDynamicLogo } from 'utils/getDynamicLogo';

import styles from './CustomPriceModal.module.scss';

export const CustomPriceModal = () => {
  const { t } = useTranslation();

  const [isStopLossModalOpen, setStopLossModalOpen] = useAtom(stopLossModalOpenAtom);
  const [isTakeProfitModalOpen, setTakeProfitModalOpen] = useAtom(takeProfitModalOpenAtom);
  const [stopLoss, setStopLoss] = useAtom(stopLossAtom);
  const [stopLossInputPrice, setStopLossInputPrice] = useAtom(stopLossInputPriceAtom);
  const [takeProfit, setTakeProfit] = useAtom(takeProfitAtom);
  const [takeProfitInputPrice, setTakeProfitInputPrice] = useAtom(takeProfitInputPriceAtom);
  const selectedPerpetual = useAtomValue(selectedPerpetualAtom);
  const setStopLossPrice = useSetAtom(stopLossPriceAtom);
  const setTakeProfitPrice = useSetAtom(takeProfitPriceAtom);

  const QuoteCurrencyIcon = useMemo(() => {
    if (!selectedPerpetual) {
      return null;
    }
    return getDynamicLogo(selectedPerpetual.quoteCurrency.toLowerCase()) as TemporaryAnyT;
  }, [selectedPerpetual]);

  const handleStopLossChange = (stopLossValue: StopLossE) => {
    setStopLossPrice(null);
    setStopLossInputPrice(null);
    setStopLoss(stopLossValue);
  };

  const handleTakeProfitChange = (takeProfitValue: TakeProfitE) => {
    setTakeProfitPrice(null);
    setTakeProfitInputPrice(null);
    setTakeProfit(takeProfitValue);
  };

  const handleOnClose = () => {
    setTakeProfitModalOpen(false);
    setStopLossModalOpen(false);
  };

  const handleStopLossClick = () => {
    setTakeProfitModalOpen(false);
    setStopLossModalOpen(true);
  };

  const handleTakeProfitClick = () => {
    setStopLossModalOpen(false);
    setTakeProfitModalOpen(true);
  };

  const stopLossTranslationMap: Record<StopLossE, string> = {
    [StopLossE.None]: t('pages.trade.order-block.stop-loss.none'),
    [StopLossE['5%']]: '5%',
    [StopLossE['25%']]: '25%',
    [StopLossE['50%']]: '50%',
    [StopLossE['75%']]: '75%',
  };

  const takeProfitTranslationMap: Record<TakeProfitE, string> = {
    [TakeProfitE.None]: t('pages.trade.order-block.take-profit.none'),
    [TakeProfitE['5%']]: '5%',
    [TakeProfitE['50%']]: '50%',
    [TakeProfitE['100%']]: '100%',
    [TakeProfitE['500%']]: '500%',
  };

  return (
    <Dialog open={isStopLossModalOpen || isTakeProfitModalOpen} onClose={handleOnClose} className={styles.dialog}>
      <DialogTitle>
        {t(`pages.trade.order-block.${isStopLossModalOpen ? 'stop-loss' : 'take-profit'}.title`)}
      </DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <div className={styles.customPrices}>
          <div
            className={classnames(styles.stopLoss, { [styles.active]: isStopLossModalOpen })}
            onClick={handleStopLossClick}
          >
            <span className={styles.price}>
              <Suspense fallback={null}>
                <QuoteCurrencyIcon width={24} height={24} className={styles.currencyIcon} />
              </Suspense>
              <span>{stopLossInputPrice || '--'}</span>
            </span>
            <span className={styles.label}>{t('pages.trade.order-block.stop-loss.title')}</span>
          </div>
          <div
            className={classnames(styles.takeProfit, { [styles.active]: isTakeProfitModalOpen })}
            onClick={handleTakeProfitClick}
          >
            <span className={styles.price}>
              <Suspense fallback={null}>
                <QuoteCurrencyIcon width={24} height={24} className={styles.currencyIcon} />
              </Suspense>
              <span>{takeProfitInputPrice || '--'}</span>
            </span>
            <span className={styles.label}>{t('pages.trade.order-block.take-profit.title')}</span>
          </div>
        </div>
        <div className={styles.chartHolder}>
          <TradingViewChart onlyChart height={450} />
        </div>
        <div className={styles.actionHolder}>
          {isStopLossModalOpen && (
            <div className={styles.priceOptions}>
              {Object.values(StopLossE).map((key) => (
                <Button
                  key={key}
                  variant="outlined"
                  className={classnames({ [styles.selected]: key === stopLoss })}
                  onClick={() => handleStopLossChange(key)}
                >
                  {stopLossTranslationMap[key]}
                </Button>
              ))}
            </div>
          )}
          {isTakeProfitModalOpen && (
            <div className={styles.priceOptions}>
              {Object.values(TakeProfitE).map((key) => (
                <Button
                  key={key}
                  variant="outlined"
                  className={classnames({ [styles.selected]: key === takeProfit })}
                  onClick={() => handleTakeProfitChange(key)}
                >
                  {takeProfitTranslationMap[key]}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
      <DialogActions className={styles.dialogAction}>
        <Button onClick={handleOnClose} variant="secondary">
          {t('common.deposit-modal.done-button')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
