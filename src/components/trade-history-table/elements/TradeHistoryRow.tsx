import classnames from 'classnames';
import { format } from 'date-fns';
import { useAtomValue } from 'jotai';
import { Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TableCell, TableRow, Typography } from '@mui/material';

import { DATETIME_FORMAT } from 'appConstants';
import { calculateProbability } from 'helpers/calculateProbability';
import { collateralToSettleConversionAtom } from 'store/pools.store';
import { OrderSideE } from 'types/enums';
import type { TableHeaderI, TemporaryAnyT, TradeHistoryWithSymbolDataI } from 'types/types';
import { getDynamicLogo } from 'utils/getDynamicLogo';
import { formatToCurrency } from 'utils/formatToCurrency';

import styles from '../TradeHistoryTable.module.scss';

interface TradeHistoryRowPropsI {
  headers: TableHeaderI<TradeHistoryWithSymbolDataI>[];
  tradeHistory: TradeHistoryWithSymbolDataI;
}

export const TradeHistoryRow = ({ headers, tradeHistory }: TradeHistoryRowPropsI) => {
  const { t } = useTranslation();

  const c2s = useAtomValue(collateralToSettleConversionAtom);

  const perpetual = tradeHistory.perpetual;
  const time = format(new Date(tradeHistory.timestamp), DATETIME_FORMAT);
  const pnlColor = tradeHistory.realizedPnl > 0 ? 'var(--d8x-color-buy-rgba)' : 'var(--d8x-color-sell-rgba)';

  const displayPrice = perpetual?.isPredictionMarket
    ? calculateProbability(tradeHistory.price, tradeHistory.side === OrderSideE.Sell)
    : tradeHistory.price;
  const displayCcy = perpetual?.isPredictionMarket ? perpetual?.quoteCurrency : perpetual?.quoteCurrency;

  const BaseCurrencyIcon = useMemo(() => {
    return getDynamicLogo(perpetual?.baseCurrency.toLowerCase() ?? '') as TemporaryAnyT;
  }, [perpetual?.baseCurrency]);

  const QuoteCurrencyIcon = useMemo(() => {
    return getDynamicLogo(perpetual?.quoteCurrency.toLowerCase() ?? '') as TemporaryAnyT;
  }, [perpetual?.quoteCurrency]);

  return (
    <TableRow key={tradeHistory.transactionHash}>
      <TableCell align={headers[0].align}>
        <div className={styles.perpetualData}>
          <div className={styles.iconsHolder}>
            <div className={styles.baseIcon}>
              <Suspense fallback={null}>
                <BaseCurrencyIcon />
              </Suspense>
            </div>
            <div className={styles.quoteIcon}>
              <Suspense fallback={null}>
                <QuoteCurrencyIcon />
              </Suspense>
            </div>
          </div>
          <div className={styles.dataHolder}>
            <Typography variant="cellSmall" className={styles.pair}>
              {tradeHistory.symbol}
            </Typography>
            <Typography variant="cellSmall" className={styles.date}>
              {time}
            </Typography>
          </div>
        </div>
      </TableCell>
      <TableCell align={headers[1].align}>
        <div className={styles.quantityData}>
          <Typography variant="cellSmall" className={styles.quantity}>
            {perpetual ? formatToCurrency(Math.abs(tradeHistory.quantity), perpetual.baseCurrency, true) : ''}
          </Typography>
          <Typography
            variant="cellSmall"
            className={classnames(styles.side, {
              [styles.buy]: tradeHistory.side.indexOf('BUY') > -1,
              [styles.sell]: tradeHistory.side.indexOf('SELL') > -1,
            })}
          >
            {tradeHistory.side.indexOf('BUY') > -1
              ? t('pages.trade.positions-table.table-content.buy')
              : t('pages.trade.positions-table.table-content.sell')}
          </Typography>
        </div>
      </TableCell>
      <TableCell align={headers[2].align}>
        <div className={styles.priceData}>
          <Typography variant="cellSmall" className={styles.price}>
            {perpetual ? formatToCurrency(displayPrice, displayCcy, true) : ''}
          </Typography>
          <Typography variant="cellSmall" className={styles.fee}>
            {perpetual
              ? formatToCurrency(
                  tradeHistory.fee * (c2s.get(perpetual.poolName)?.value ?? 1),
                  tradeHistory.settleSymbol,
                  true
                )
              : ''}
          </Typography>
        </div>
      </TableCell>
      <TableCell align={headers[3].align}>
        <Typography variant="cellSmall" className={styles.realizedProfit} style={{ color: pnlColor }}>
          {perpetual
            ? formatToCurrency(
                tradeHistory.realizedPnl * (c2s.get(perpetual.poolName)?.value ?? 1),
                tradeHistory.settleSymbol,
                true
              )
            : ''}
        </Typography>
      </TableCell>
      {/* <TableCell align={headers[7].align} /> */}
    </TableRow>
  );
};
