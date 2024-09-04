import { useSetAtom } from 'jotai';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@mui/material';
import { History } from '@mui/icons-material';

import { TooltipMobile } from 'components/tooltip-mobile/TooltipMobile';
import { tradeHistoryModalOpenAtom } from 'store/global-modals.store';

import styles from './TradeHistoryButton.module.scss';
import { TradeHistoryModal } from '../../../trade-history-modal/TradeHistoryModal';

export const TradeHistoryButton = memo(() => {
  const { t } = useTranslation();

  const setTradeHistoryModalOpen = useSetAtom(tradeHistoryModalOpenAtom);

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className={styles.root}>
      <TooltipMobile tooltip={t('pages.trade.history-table.table-title')}>
        <Button
          onClick={() => setTradeHistoryModalOpen(true)}
          className={styles.iconButton}
          variant="outlined"
          ref={buttonRef}
        >
          <History className={styles.icon} />
        </Button>
      </TooltipMobile>

      <TradeHistoryModal />
    </div>
  );
});
