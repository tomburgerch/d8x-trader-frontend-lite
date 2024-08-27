import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import { Button, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Dialog } from 'components/dialog/Dialog';
import { tradeHistoryModalOpenAtom } from 'store/global-modals.store';

import styles from './TradeHistoryModal.module.scss';
import { TradeHistoryTable } from '../trade-history-table/TradeHistoryTable';

export const TradeHistoryModal = () => {
  const { t } = useTranslation();

  const [isTradeHistoryModalOpen, setTradeHistoryModalOpen] = useAtom(tradeHistoryModalOpenAtom);

  const handleOnClose = () => {
    setTradeHistoryModalOpen(false);
  };

  return (
    <Dialog open={isTradeHistoryModalOpen} onClose={handleOnClose} className={styles.dialog}>
      <DialogTitle>{t('pages.trade.history-table.table-title')}</DialogTitle>
      <DialogContent className={styles.dialogContent}>
        <TradeHistoryTable />
      </DialogContent>
      <DialogActions className={styles.dialogAction}>
        <Button onClick={handleOnClose} variant="secondary">
          {t('common.info-modal.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
