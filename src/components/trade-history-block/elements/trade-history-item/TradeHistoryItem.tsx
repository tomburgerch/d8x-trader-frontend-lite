import classnames from 'classnames';
import { format } from 'date-fns';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { DATETIME_FORMAT } from 'appConstants';
import { getDynamicLogo } from 'utils/getDynamicLogo';
import { formatToCurrency } from 'utils/formatToCurrency';
import { type TemporaryAnyT, type TradeHistoryWithSymbolDataI } from 'types/types';

import styles from './TradeHistoryItem.module.scss';

interface TradeHistoryItemPropsI {
  tradeHistory: TradeHistoryWithSymbolDataI;
}

export const TradeHistoryItem = ({ tradeHistory }: TradeHistoryItemPropsI) => {
  const { t } = useTranslation();

  const BaseIconComponent = useMemo(() => {
    return getDynamicLogo(tradeHistory.perpetual?.baseCurrency.toLowerCase() ?? '') as TemporaryAnyT;
  }, [tradeHistory.perpetual?.baseCurrency]);

  const QuoteIconComponent = useMemo(() => {
    return getDynamicLogo(tradeHistory.perpetual?.quoteCurrency.toLowerCase() ?? '') as TemporaryAnyT;
  }, [tradeHistory.perpetual?.quoteCurrency]);

  const time = format(new Date(tradeHistory.timestamp), DATETIME_FORMAT);

  console.log({ side: tradeHistory.side });

  return (
    <div className={styles.root}>
      <div className={styles.iconsHolder}>
        <div className={styles.baseIcon}>
          <Suspense fallback={null}>
            <BaseIconComponent />
          </Suspense>
        </div>
        <div className={styles.quoteIcon}>
          <Suspense fallback={null}>
            <QuoteIconComponent />
          </Suspense>
        </div>
      </div>
      <div className={styles.dataHolder}>
        <div className={styles.leftBlock}>
          <span className={styles.pair}>
            {tradeHistory.perpetual?.baseCurrency}/{tradeHistory.perpetual?.quoteCurrency}
          </span>
          <span className={styles.date}>{time}</span>
        </div>
        <div className={styles.rightBlock}>
          <span className={styles.amount}>
            {tradeHistory.perpetual
              ? formatToCurrency(Math.abs(tradeHistory.quantity), tradeHistory.perpetual.baseCurrency, true)
              : ''}
          </span>
          <span
            className={classnames(styles.side, {
              [styles.buy]: tradeHistory.side.indexOf('BUY') > -1,
              [styles.sell]: tradeHistory.side.indexOf('SELL') > -1,
            })}
          >
            {tradeHistory.side.indexOf('BUY') > -1
              ? t('pages.trade.positions-table.table-content.buy')
              : t('pages.trade.positions-table.table-content.sell')}
          </span>
          <span></span>
        </div>
      </div>
    </div>
  );
};
