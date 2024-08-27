import classnames from 'classnames';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';

import { Card, CardContent, Typography } from '@mui/material';

import { Separator } from 'components/separator/Separator';
import { InfoLabelBlock } from 'components/info-label-block/InfoLabelBlock';
import { getTradesHistory } from 'network/history';
import { tradeHistoryModalOpenAtom } from 'store/global-modals.store';
import { collateralToSettleConversionAtom, openOrdersAtom, perpetualsAtom, tradesHistoryAtom } from 'store/pools.store';
import type { TradeHistoryWithSymbolDataI } from 'types/types';
import { isEnabledChain } from 'utils/isEnabledChain';

import { TradeHistoryItem } from './elements/trade-history-item/TradeHistoryItem';

import styles from './TradeHistoryBlock.module.scss';
import { TradeHistoryModal } from '../trade-history-modal/TradeHistoryModal';

export const TradeHistoryBlock = () => {
  const { t } = useTranslation();

  const [tradesHistory, setTradesHistory] = useAtom(tradesHistoryAtom);
  const perpetuals = useAtomValue(perpetualsAtom);
  const openOrders = useAtomValue(openOrdersAtom);
  const c2s = useAtomValue(collateralToSettleConversionAtom);
  const setTradeHistoryModalOpen = useSetAtom(tradeHistoryModalOpenAtom);

  const { address, isConnected, chainId } = useAccount();

  const updateTradesHistoryRef = useRef(false);

  const handleViewAllClick = useCallback(() => {
    setTradeHistoryModalOpen(true);
  }, [setTradeHistoryModalOpen]);

  const fetchTradesHistory = useCallback(() => {
    if (updateTradesHistoryRef.current) {
      return;
    }
    if (!address || !isConnected || !isEnabledChain(chainId)) {
      setTradesHistory([]);
      return;
    }

    updateTradesHistoryRef.current = true;
    getTradesHistory(chainId, address)
      .then((data) => {
        setTradesHistory(data.length > 0 ? data : []);
      })
      .catch(console.error)
      .finally(() => {
        updateTradesHistoryRef.current = false;
      });
  }, [chainId, address, isConnected, setTradesHistory]);

  useEffect(() => {
    fetchTradesHistory();
  }, [openOrders, fetchTradesHistory]);

  const partOfTradeHistory = useMemo(() => {
    return tradesHistory.slice(0, 5);
  }, [tradesHistory]);

  const tradesHistoryWithSymbol: TradeHistoryWithSymbolDataI[] = useMemo(() => {
    return partOfTradeHistory.map((tradeHistory) => {
      const perpetual = perpetuals.find(({ id }) => id === tradeHistory.perpetualId);
      const settleSymbol = perpetual?.poolName ? c2s.get(perpetual?.poolName)?.settleSymbol ?? '' : '';
      return {
        ...tradeHistory,
        symbol: perpetual ? `${perpetual.baseCurrency}/${perpetual.quoteCurrency}/${settleSymbol}` : '',
        settleSymbol,
        perpetual: perpetual ?? null,
      };
    });
  }, [partOfTradeHistory, perpetuals, c2s]);

  return (
    <>
      <Card className={styles.root}>
        <CardContent className={classnames(styles.card, styles.header)}>
          <InfoLabelBlock
            title={t('pages.trade.history-table.table-title')}
            content={<Typography>{t('pages.trade.history-table.body')}</Typography>}
          />
          <Typography variant="bodySmall" className={styles.viewAllLabel} onClick={handleViewAllClick}>
            {t('common.view-all')}
          </Typography>
        </CardContent>
        <Separator className={styles.separator} />
        <CardContent className={classnames(styles.card, styles.itemsHolder)}>
          {tradesHistoryWithSymbol.map((trade) => (
            <TradeHistoryItem key={trade.orderId} tradeHistory={trade} />
          ))}
        </CardContent>
      </Card>

      <TradeHistoryModal />
    </>
  );
};
