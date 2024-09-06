import { useSetAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { TradeHistoryBlockItems } from 'components/trade-history-block-items/TradeHistoryBlockItems';
import { useTradesHistory } from 'components/trade-history-table/hooks/useTradesHistory';
import { triggerScrollToTablesAtom } from 'store/pools.store';

import styles from './TradeShortHistoryModal.module.scss';

interface TradeShortHistoryModalPropsI {
  isModalOpen: boolean;
  onClose: () => void;
}

export const TradeShortHistoryModal = ({ isModalOpen, onClose }: TradeShortHistoryModalPropsI) => {
  const { t } = useTranslation();

  const { tradesHistory } = useTradesHistory();

  const setTriggerScrollToTables = useSetAtom(triggerScrollToTablesAtom);

  const partOfTradeHistory = useMemo(() => {
    return tradesHistory.slice(0, 5);
  }, [tradesHistory]);

  const handleViewAllClick = useCallback(() => {
    onClose();
    setTriggerScrollToTables((prev) => !prev);
  }, [onClose, setTriggerScrollToTables]);

  return (
    <Dialog
      open={isModalOpen}
      onClose={onClose}
      onCloseClick={onClose}
      className={styles.dialog}
      dialogTitle={
        <span>
          <span>{t('pages.trade.history-table.table-title')}</span>
          <Typography variant="bodySmall">
            {' '}
            (
            <span className={styles.viewAllLabel} onClick={handleViewAllClick}>
              {t('common.view-all')}
            </span>
            )
          </Typography>
        </span>
      }
    >
      <div className={styles.itemsHolder}>
        <TradeHistoryBlockItems tradesHistory={partOfTradeHistory} />
      </div>
    </Dialog>
  );
};
